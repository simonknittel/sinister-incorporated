import { EventActivityType, EventSource } from "@sam-monorepo/database/browser";
import type { Prisma } from "@sam-monorepo/database/client";
import type { AuditEventInput } from "@sam-monorepo/domain";
import {
  AuditEventType,
  buildBriefingRootPageSeed,
} from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  DATE_TIME_INPUT_DESCRIPTION,
  dateTimeInputSchema,
} from "../dateTime.js";
import { ValidationError } from "../errors.js";
import { triggerNotificationsAfterSave } from "../notifications.js";
import { withSpan } from "../withSpan.js";
import { createEventActivity } from "./eventActivity.js";
import { requireDescriptionFitsDiscord } from "./eventDescription.js";
import { EventErrorMessage } from "./eventErrors.js";
import {
  eventDescriptionSchema,
  eventNameSchema,
  eventVisibilitySchema,
  visibilityRoleIdsSchema,
} from "./eventInputSchemas.js";
import { toEventVisibility } from "./eventOutput.js";
import { resolveVisibilityRoleIds } from "./eventVisibilityRoles.js";
import { loadEventOutput, type GetEventOutput } from "./getEvent.js";

/** The briefing copy of a template dominates the runtime — same bound the wiki copy uses */
const TRANSACTION_TIMEOUT_MS = 30_000;

export const createEventInputSchema = z.object({
  name: eventNameSchema,
  description: eventDescriptionSchema.optional(),
  start_time: dateTimeInputSchema,
  end_time: dateTimeInputSchema.describe(
    `After start_time. ${DATE_TIME_INPUT_DESCRIPTION}`,
  ),
  visibility: eventVisibilitySchema,
  visibility_role_ids: visibilityRoleIdsSchema.optional(),
});

export type CreateEventInput = z.infer<typeof createEventInputSchema>;

/**
 * A template that the app applies to the new event, in the transaction of
 * the event. The event templates are not part of this package yet, thus the
 * app loads the template and copies its content.
 */
export interface EventTemplateApplication {
  readonly id: string;
  /** For the audit event: the name at the time of the creation */
  readonly name: string;
  /**
   * True when the template brings its own briefing. Then the event does not
   * get the empty briefing root page.
   */
  readonly copiesBriefing: boolean;
  /**
   * True when the copied briefing is readable for more than the managers
   * from the first second. The publication is recorded with the creation,
   * thus a later scope change does not send the one-time "briefing
   * published" notification: the creation notification already announced it.
   */
  readonly isBriefingPublished: boolean;
  /**
   * Runs before the event exists. Gives the id of the copy of the cover image
   * of the template, or null.
   */
  readonly copyCoverImage: (
    transaction: Prisma.TransactionClient,
    citizenId: string,
  ) => Promise<string | null>;
  /** Runs after the event exists: copies the lineup and the briefing */
  readonly copyContent: (
    transaction: Prisma.TransactionClient,
    eventId: string,
    citizenId: string,
  ) => Promise<void>;
}

/**
 * The parts of a new event that only the app gives, not fields of the input
 * schema: the MCP server has no uploads and no templates
 */
export interface CreateEventOptions {
  /** An image that the actor uploaded. The use case checks it. */
  readonly coverImageId?: string;
  readonly template?: EventTemplateApplication;
}

export interface CreateEventOutput {
  readonly event: GetEventOutput;
  /**
   * False when the event is saved, but the notifications failed. The event
   * stands, thus the caller must not create it again.
   */
  readonly notifications_sent: boolean;
}

/**
 * The cover was uploaded by the form before submitting; it must be the
 * submitter's own image so nobody can attach someone else's upload.
 */
const requireOwnCoverImage = async (
  context: ApplicationContext,
  citizenId: string,
  coverImageId: string,
) => {
  const coverImage = await context.prisma.upload.findUnique({
    where: { id: coverImageId },
    select: { createdById: true, mimeType: true },
  });
  const isOwnImageUpload =
    coverImage !== null &&
    coverImage.createdById === citizenId &&
    coverImage.mimeType.startsWith("image/");
  if (!isOwnImageUpload)
    throw new ValidationError(EventErrorMessage.InvalidCoverImage);
};

/**
 * Creates an app event with its briefing root page (or the briefing of the
 * template) and notifies about it. The creator becomes its organizer.
 */
export const createEvent = (
  context: ApplicationContext,
  actor: Actor,
  input: CreateEventInput,
  { coverImageId, template }: CreateEventOptions = {},
): Promise<CreateEventOutput> =>
  withSpan(context, "createEvent", async () => {
    requirePermission(actor, "event", "create");
    const citizenId = requireCitizen(actor).id;

    const startTime = input.start_time;
    const endTime = input.end_time;
    if (endTime <= startTime)
      throw new ValidationError(EventErrorMessage.EndBeforeStart);
    requireDescriptionFitsDiscord(context, input.description);

    const visibility = toEventVisibility(input.visibility);
    const visibilityRoleIds = await resolveVisibilityRoleIds(
      context,
      actor,
      visibility,
      input.visibility_role_ids ?? [],
    );

    if (coverImageId)
      await requireOwnCoverImage(context, citizenId, coverImageId);

    /**
     * Create the event with its briefing and activity entry
     */
    const createdEvent = await context.prisma.$transaction(
      async (transaction) => {
        /**
         * The event gets its own copy of the template's cover, so editing or
         * deleting one never touches the other.
         */
        const copiedCoverImageId = template
          ? await template.copyCoverImage(transaction, citizenId)
          : null;

        const event = await transaction.event.create({
          data: {
            source: EventSource.APP,
            name: input.name,
            description: input.description || null,
            startTime,
            endTime,
            visibility,
            visibilityRoles: {
              create: visibilityRoleIds.map((roleId) => ({ roleId })),
            },
            createdById: citizenId,
            coverImageId: coverImageId ?? copiedCoverImageId ?? null,
            briefingPublishedAt: template?.isBriefingPublished
              ? context.now()
              : null,
            /**
             * A template brings its own briefing, copied below. An event
             * without a root page has no briefing and no way back to one.
             */
            ...(template?.copiesBriefing
              ? {}
              : {
                  wikiPages: { create: buildBriefingRootPageSeed(citizenId) },
                }),
          },
          select: {
            id: true,
            name: true,
          },
        });

        if (template)
          await template.copyContent(transaction, event.id, citizenId);

        await createEventActivity(transaction, {
          eventId: event.id,
          citizenId,
          type: EventActivityType.CREATED,
          payload: null,
        });

        return event;
      },
      { timeout: TRANSACTION_TIMEOUT_MS },
    );

    const auditEvents: AuditEventInput[] = [
      {
        type: AuditEventType.EVENT_CREATED_IN_APP,
        data: {
          eventId: createdEvent.id,
          name: createdEvent.name,
        },
        createdById: actor.userId,
      },
    ];
    if (template)
      auditEvents.push({
        type: AuditEventType.EVENT_CREATED_FROM_TEMPLATE,
        data: {
          eventId: createdEvent.id,
          templateId: template.id,
          templateName: template.name,
        },
        createdById: actor.userId,
      });
    await context.audit.create(auditEvents);

    const notificationsSent = await triggerNotificationsAfterSave(context, [
      { type: "EventCreated", payload: { eventId: createdEvent.id } },
    ]);

    return {
      event: await loadEventOutput(context, actor, createdEvent.id),
      notifications_sent: notificationsSent,
    };
  });
