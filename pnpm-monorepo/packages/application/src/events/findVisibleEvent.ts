import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { EventErrorMessage } from "./eventErrors.js";
import { EVENT_DETAILS_INCLUDE, type EventDetails } from "./eventSelects.js";
import { canActorSeeEvent } from "./eventVisibility.js";

/**
 * One event that the actor can see, with everything that its pages share.
 * An event that the actor cannot see is indistinguishable from a missing
 * one: both throw a `NotFoundError`.
 */
export const findVisibleEvent = async (
  context: ApplicationContext,
  actor: Actor,
  eventId: string,
): Promise<EventDetails> => {
  requirePermission(actor, "event", "read");

  const event = await context.prisma.event.findUnique({
    where: { id: eventId },
    include: EVENT_DETAILS_INCLUDE,
  });

  if (!event || !canActorSeeEvent(actor, event))
    throw new NotFoundError(EventErrorMessage.NotFound);

  return event;
};
