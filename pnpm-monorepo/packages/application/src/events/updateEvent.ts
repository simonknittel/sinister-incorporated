import { EventActivityType, EventSource } from "@sam-monorepo/database/browser";
import { AuditEventType, type AuditEventInput } from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext, Notification } from "../context.js";
import { ForbiddenError, NotFoundError } from "../errors.js";
import { triggerNotificationsAfterSave } from "../notifications.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { createEventActivity } from "./eventActivity.js";
import {
  EventConflict,
  EventConflictError,
  EventValidationError,
  EventValidationProblem,
} from "./eventErrors.js";
import {
  eventDateTimeSchema,
  eventDescriptionSchema,
  eventNameSchema,
  eventVisibilitySchema,
  visibilityRoleIdsSchema,
} from "./eventInputSchemas.js";
import { VISIBLE_EVENT_MANAGE_GUARD_SELECT } from "./eventManageGuard.js";
import {
  isAllowedToManageEvent,
  isAllowedToManagePositions,
  isEventUpdatable,
} from "./eventManageRules.js";
import { toEventVisibility } from "./eventOutput.js";
import { canActorSeeEvent } from "./eventVisibility.js";
import { resolveVisibilityRoleIds } from "./eventVisibilityRoles.js";
import { loadEventOutput, type GetEventOutput } from "./getEvent.js";

/** What an update changed */
export enum EventChange {
  Name = "name",
  Description = "description",
  /** The start or the end */
  Schedule = "schedule",
  /** The visibility or the visibility roles */
  Visibility = "visibility",
  LineupEnabled = "lineup_enabled",
}

/**
 * Only the fields of the input change. The fields of an event that comes
 * from Discord stay as Discord gives them: only `lineup_enabled` can change.
 */
export const updateEventInputSchema = z.object({
  event_id: idSchema,
  name: eventNameSchema.optional(),
  description: eventDescriptionSchema.optional(),
  start_time: eventDateTimeSchema.optional(),
  end_time: eventDateTimeSchema
    .optional()
    .describe("After the start. ISO 8601 with a time zone offset."),
  visibility: eventVisibilitySchema.optional(),
  visibility_role_ids: visibilityRoleIdsSchema
    .optional()
    .describe(
      "The role ids (from list_roles) that see a restricted event. Without it, a restricted event keeps its roles.",
    ),
  lineup_enabled: z
    .boolean()
    .optional()
    .describe(
      "True shows the lineup to the participants and notifies them, false hides it again. Needs can_manage_positions.",
    ),
});

export type UpdateEventInput = z.infer<typeof updateEventInputSchema>;

/** Options of the use case for the app, not fields of the input schema */
export interface UpdateEventOptions {
  /**
   * True when the caller carries a changed name, description or schedule
   * over to the Discord event after the use case (only the app can reach
   * Discord). Without it, such a change of an event that is published on
   * Discord is refused: else the Discord event would show outdated data.
   */
  readonly syncsDiscordPublication?: boolean;
}

export interface UpdateEventOutput {
  readonly event: GetEventOutput;
  /** Empty when the event already had the given values */
  readonly changes: EventChange[];
  /**
   * False when the changes are saved, but the notifications failed. The
   * changes stand, thus the caller must not save them again.
   */
  readonly notifications_sent: boolean;
}

const DETAIL_FIELDS = [
  "name",
  "description",
  "start_time",
  "end_time",
  "visibility",
  "visibility_role_ids",
] as const satisfies readonly (keyof UpdateEventInput)[];

/** The changes that the event page and the Discord event show */
const CONTENT_CHANGES: ReadonlySet<EventChange> = new Set([
  EventChange.Name,
  EventChange.Description,
  EventChange.Schedule,
]);

const toSortedKey = (roleIds: readonly string[]) =>
  roleIds.toSorted().join(",");

/**
 * Changes the details of an app event (name, description, schedule,
 * visibility) and whether its lineup is visible. Writes nothing when the
 * values are the same.
 */
export const updateEvent = (
  context: ApplicationContext,
  actor: Actor,
  input: UpdateEventInput,
  { syncsDiscordPublication = false }: UpdateEventOptions = {},
): Promise<UpdateEventOutput> =>
  withSpan(context, "updateEvent", async () => {
    const changesDetails = DETAIL_FIELDS.some(
      (field) => input[field] !== undefined,
    );
    const changesLineup = input.lineup_enabled !== undefined;

    /**
     * Authorize the request
     */
    const event = await context.prisma.event.findUnique({
      where: {
        id: input.event_id,
        deletedAt: null,
      },
      select: {
        ...VISIBLE_EVENT_MANAGE_GUARD_SELECT,
        source: true,
        name: true,
        description: true,
        lineupEnabled: true,
        discordPublishedId: true,
      },
    });
    if (!event || !canActorSeeEvent(actor, event))
      throw new NotFoundError("The event does not exist");
    if (changesDetails && event.source !== EventSource.APP)
      throw new EventConflictError(EventConflict.DiscordEvent);
    if (!isEventUpdatable(event, context.now()))
      throw new EventConflictError(EventConflict.EventEnded);
    if (changesDetails && !isAllowedToManageEvent(actor, event))
      throw new ForbiddenError("The user cannot manage the event");
    if (changesLineup && !isAllowedToManagePositions(actor, event))
      throw new ForbiddenError("The user cannot manage the lineup");
    const citizenId = actor.citizen?.id ?? null;

    /**
     * Validate the request
     */
    const startTime = input.start_time
      ? new Date(input.start_time)
      : event.startTime;
    const endTime = input.end_time ? new Date(input.end_time) : event.endTime;
    if (changesDetails && (endTime === null || endTime <= startTime))
      throw new EventValidationError(EventValidationProblem.EndBeforeStart);

    const visibility = input.visibility
      ? toEventVisibility(input.visibility)
      : event.visibility;
    const previousRoleIds = event.visibilityRoles.map(
      (visibilityRole) => visibilityRole.roleId,
    );
    const visibilityRoleIds = changesDetails
      ? await resolveVisibilityRoleIds(
          context,
          visibility,
          input.visibility_role_ids ?? previousRoleIds,
        )
      : previousRoleIds;

    /**
     * Diff the fields
     */
    const name = input.name ?? event.name;
    const description =
      input.description === undefined
        ? event.description
        : input.description || null;

    const changes: EventChange[] = [];
    if (name !== event.name) changes.push(EventChange.Name);
    if (description !== event.description)
      changes.push(EventChange.Description);
    if (
      startTime.getTime() !== event.startTime.getTime() ||
      endTime?.getTime() !== event.endTime?.getTime()
    )
      changes.push(EventChange.Schedule);
    if (
      visibility !== event.visibility ||
      toSortedKey(previousRoleIds) !== toSortedKey(visibilityRoleIds)
    )
      changes.push(EventChange.Visibility);
    if (changesLineup && input.lineup_enabled !== event.lineupEnabled)
      changes.push(EventChange.LineupEnabled);

    const changesContent = changes.some((change) =>
      CONTENT_CHANGES.has(change),
    );
    const changesDetailFields = changes.some(
      (change) => change !== EventChange.LineupEnabled,
    );
    const changesLineupEnabled = changes.includes(EventChange.LineupEnabled);

    if (changes.length <= 0)
      return {
        event: await loadEventOutput(context, actor, event.id),
        changes,
        notifications_sent: true,
      };

    if (
      changesContent &&
      event.discordPublishedId !== null &&
      !syncsDiscordPublication
    )
      throw new EventConflictError(EventConflict.PublishedOnDiscord);

    /**
     * Update the event and record the activity entries atomically
     */
    await context.prisma.$transaction(async (transaction) => {
      await transaction.event.update({
        where: {
          id: event.id,
        },
        data: {
          ...(changesDetailFields
            ? {
                name,
                description,
                startTime,
                endTime,
                visibility,
                visibilityRoles: {
                  deleteMany: {},
                  create: visibilityRoleIds.map((roleId) => ({ roleId })),
                },
              }
            : {}),
          ...(changesLineupEnabled
            ? { lineupEnabled: input.lineup_enabled }
            : {}),
        },
      });

      if (changes.includes(EventChange.Name))
        await createEventActivity(transaction, {
          eventId: event.id,
          citizenId,
          type: EventActivityType.TITLE_UPDATED,
          payload: {
            previousName: event.name,
            newName: name,
          },
        });

      if (changes.includes(EventChange.Description))
        await createEventActivity(transaction, {
          eventId: event.id,
          citizenId,
          type: EventActivityType.DESCRIPTION_UPDATED,
          payload: null,
        });

      if (changes.includes(EventChange.Schedule))
        await createEventActivity(transaction, {
          eventId: event.id,
          citizenId,
          type: EventActivityType.SCHEDULE_UPDATED,
          payload: {
            previousStartTime: event.startTime.toISOString(),
            newStartTime: startTime.toISOString(),
            previousEndTime: event.endTime?.toISOString() ?? null,
            newEndTime: endTime?.toISOString() ?? null,
          },
        });

      /**
       * The activity feed only exists on app events; recorded in both
       * directions, rendered as "published"/"withdrawn".
       */
      if (changesLineupEnabled && event.source === EventSource.APP)
        await createEventActivity(transaction, {
          eventId: event.id,
          citizenId,
          type: EventActivityType.LINEUP_TOGGLED,
          payload: { enabled: input.lineup_enabled === true },
        });
    });

    const auditEvents: AuditEventInput[] = [];
    if (changesContent)
      auditEvents.push({
        type: AuditEventType.EVENT_UPDATED_IN_APP,
        data: {
          eventId: event.id,
          changedFields: changes.flatMap((change) =>
            CONTENT_CHANGES.has(change) ? [change] : [],
          ),
        },
        createdById: actor.userId,
      });
    if (changes.includes(EventChange.Visibility))
      auditEvents.push({
        type: AuditEventType.EVENT_VISIBILITY_UPDATED,
        data: {
          eventId: event.id,
          visibility,
          roleIds: visibilityRoleIds,
        },
        createdById: actor.userId,
      });
    if (changesLineupEnabled)
      auditEvents.push({
        type: AuditEventType.EVENT_LINEUP_STATUS_CHANGED,
        data: {
          eventId: event.id,
          enabled: input.lineup_enabled === true,
        },
        createdById: actor.userId,
      });
    await context.audit.create(auditEvents);

    const notifications: Notification[] = [];
    if (changesContent)
      notifications.push({
        type: "EventUpdated",
        payload: { eventId: event.id },
      });
    if (changesLineupEnabled && input.lineup_enabled)
      notifications.push({
        type: "EventLineupEnabled",
        payload: { eventId: event.id },
      });
    const notificationsSent =
      notifications.length > 0
        ? await triggerNotificationsAfterSave(context, notifications)
        : true;

    return {
      event: await loadEventOutput(context, actor, event.id),
      changes,
      notifications_sent: notificationsSent,
    };
  });
