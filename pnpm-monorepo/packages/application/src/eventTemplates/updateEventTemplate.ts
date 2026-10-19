import {
  EventDiscordPublishTarget,
  EventVisibility,
} from "@sam-monorepo/database/browser";
import {
  AuditEventType,
  DISCORD_CHANNEL_ID_MAX_LENGTH,
  DISCORD_EVENT_LOCATION_MAX_LENGTH,
} from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { rethrowRecordNotFound, ValidationError } from "../errors.js";
import { requireOwnCoverImage } from "../events/coverImage.js";
import { requireDescriptionFitsDiscord } from "../events/eventDescription.js";
import { EventErrorMessage } from "../events/eventErrors.js";
import {
  eventDescriptionSchema,
  eventNameSchema,
  eventVisibilitySchema,
  visibilityRoleIdsSchema,
} from "../events/eventInputSchemas.js";
import { toEventVisibility } from "../events/eventOutput.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { requireEditableEventTemplate } from "./eventTemplateAccess.js";
import { EventTemplateErrorMessage } from "./eventTemplateErrors.js";

export const updateEventTemplateInputSchema = z.object({
  template_id: idSchema,
  name: eventNameSchema,
  description: eventDescriptionSchema.optional(),
  /** The visibility of the events that the template creates */
  visibility: eventVisibilitySchema,
  visibility_role_ids: visibilityRoleIdsSchema.optional(),
  /**
   * The Discord publishing an event created from this template starts with.
   * Absent means "do not publish".
   */
  discord_publish_target: z.enum(EventDiscordPublishTarget).optional(),
  discord_publish_channel_id: z
    .string()
    .max(DISCORD_CHANNEL_ID_MAX_LENGTH)
    .optional(),
  discord_publish_location: z
    .string()
    .trim()
    .max(DISCORD_EVENT_LOCATION_MAX_LENGTH)
    .optional(),
});

export type UpdateEventTemplateInput = z.infer<
  typeof updateEventTemplateInputSchema
>;

/** The parts of a template change that only the app gives: the uploads */
export interface UpdateEventTemplateOptions {
  /**
   * The cover image: an image that the actor uploaded (the use case checks a
   * new one), null for no cover. Absent keeps the current cover.
   */
  readonly coverImageId?: string | null;
}

export interface UpdateEventTemplateOutput {
  readonly id: string;
  readonly name: string;
  /** True when the write changed or removed the cover image */
  readonly cover_image_changed: boolean;
}

/**
 * Changes the template's own data and everything it prefills into a new
 * event. The visibility here describes the future event, not who may see the
 * template: the role shares decide that.
 */
export const updateEventTemplate = (
  context: ApplicationContext,
  actor: Actor,
  input: UpdateEventTemplateInput,
  options: UpdateEventTemplateOptions = {},
): Promise<UpdateEventTemplateOutput> =>
  withSpan(context, "updateEventTemplate", async () => {
    /**
     * Authorize the request
     */
    const { template } = await requireEditableEventTemplate(
      context,
      actor,
      input.template_id,
      { select: { name: true, coverImageId: true } },
    );
    const citizenId = actor.citizen?.id ?? null;

    requireDescriptionFitsDiscord(context, input.description);

    /**
     * Validate the request. The roles themselves are not checked (a known
     * defect).
     */
    const visibility = toEventVisibility(input.visibility);
    const visibilityRoleIds =
      visibility === EventVisibility.RESTRICTED
        ? (input.visibility_role_ids ?? [])
        : [];
    if (
      visibility === EventVisibility.RESTRICTED &&
      visibilityRoleIds.length === 0
    )
      throw new ValidationError(EventErrorMessage.NoVisibilityRole);

    /**
     * A newly picked cover must be the actor's own image so nobody can
     * attach someone else's upload; keeping the current one needs no check.
     */
    const coverImageId =
      options.coverImageId === undefined
        ? template.coverImageId
        : options.coverImageId;
    const coverImageChanged = coverImageId !== template.coverImageId;
    if (coverImageChanged && coverImageId !== null) {
      if (citizenId === null)
        throw new ValidationError(EventErrorMessage.InvalidCoverImage);

      await requireOwnCoverImage(context, citizenId, coverImageId);
    }

    /**
     * The three publish columns only make sense together — a CHECK
     * constraint enforces that — so they are always written as one set.
     */
    const publishesToChannel =
      input.discord_publish_target === EventDiscordPublishTarget.CHANNEL;
    if (publishesToChannel && !input.discord_publish_channel_id)
      throw new ValidationError(EventTemplateErrorMessage.ChannelMissing);

    /**
     * The condition on `deletedAt` keeps a different request from deleting
     * the template between the check and the write unnoticed
     */
    const updatedTemplate = await rethrowRecordNotFound(
      () =>
        context.prisma.eventTemplate.update({
          where: { id: template.id, deletedAt: null },
          data: {
            name: input.name,
            description: input.description || null,
            coverImageId,
            visibility,
            visibilityRoles: {
              deleteMany: {},
              create: visibilityRoleIds.map((roleId) => ({ roleId })),
            },
            discordPublishTarget: input.discord_publish_target ?? null,
            discordPublishChannelId: publishesToChannel
              ? (input.discord_publish_channel_id ?? null)
              : null,
            discordPublishLocation:
              input.discord_publish_target ===
              EventDiscordPublishTarget.EXTERNAL
                ? input.discord_publish_location || null
                : null,
            updatedById: citizenId,
          },
          select: { id: true, name: true },
        }),
      EventTemplateErrorMessage.NotFound,
    );

    await context.audit.create([
      {
        type: AuditEventType.EVENT_TEMPLATE_UPDATED,
        data: {
          templateId: template.id,
          previousName: template.name,
          name: updatedTemplate.name,
          visibility,
          visibilityRoleIds,
          coverImageChanged,
        },
        createdById: actor.userId,
      },
    ]);

    return { ...updatedTemplate, cover_image_changed: coverImageChanged };
  });
