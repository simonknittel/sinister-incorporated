import { EventSource } from "@sam-monorepo/database/browser";
import type { Event } from "@sam-monorepo/database/client";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { EventConflict, EventConflictError } from "./eventErrors.js";
import { canActorSeeEvent } from "./eventVisibility.js";

/**
 * Loads an app event for a participation write. Gives null when the event
 * does not exist, is not an app event, is soft-deleted or is not visible to
 * the actor — deliberately indistinguishable cases.
 */
export const findParticipatableAppEvent = async (
  context: ApplicationContext,
  actor: Actor,
  eventId: string,
) => {
  const event = await context.prisma.event.findUnique({
    where: {
      id: eventId,
      source: EventSource.APP,
      deletedAt: null,
    },
    select: {
      id: true,
      visibility: true,
      createdById: true,
      deletedAt: true,
      discordCreatorId: true,
      startTime: true,
      endTime: true,
      visibilityRoles: { select: { roleId: true } },
      managers: { select: { id: true } },
    },
  });
  if (!event || !canActorSeeEvent(actor, event)) return null;

  return event;
};

/** Like `findParticipatableAppEvent()`, but throws instead of giving null */
export const requireParticipatableAppEvent = async (
  context: ApplicationContext,
  actor: Actor,
  eventId: string,
) => {
  const event = await findParticipatableAppEvent(context, actor, eventId);
  if (!event) throw new NotFoundError("The event does not exist");

  return event;
};

/**
 * Participation (sign-up, comment updates, cancellation) stays open until
 * the event's end — deliberately longer than the `isEventUpdatable` freeze
 * used for management writes. App events always have an end time; a
 * missing one closes participation defensively.
 */
export const isParticipationOpen = (
  event: Pick<Event, "endTime">,
  now: Date,
): boolean => event.endTime !== null && event.endTime > now;

/**
 * The app event of an own participation write: visible to the actor, and
 * the participation is still open
 */
export const requireOpenParticipatableAppEvent = async (
  context: ApplicationContext,
  actor: Actor,
  eventId: string,
) => {
  const event = await requireParticipatableAppEvent(context, actor, eventId);
  if (!isParticipationOpen(event, context.now()))
    throw new EventConflictError(EventConflict.ParticipationClosed);

  return event;
};
