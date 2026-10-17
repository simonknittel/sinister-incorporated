import type { Prisma } from "@sam-monorepo/database/client";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../errors.js";
import {
  isAllowedToManagePositions,
  isEventUpdatable,
  type EventManageInput,
} from "../events/eventManageRules.js";
import { LineupErrorMessage } from "./lineupErrors.js";

/** What the guards of the lineup decide on, and the name for the outputs */
const LINEUP_EVENT_SELECT = {
  id: true,
  name: true,
  startTime: true,
  endTime: true,
  discordCreatorId: true,
  createdById: true,
  managers: { select: { id: true } },
} as const satisfies Prisma.EventSelect;

/** What the use cases of the positions read of a position before a change */
const LINEUP_POSITION_SELECT = {
  id: true,
  name: true,
  eventId: true,
  citizenId: true,
  fontSize: true,
  backgroundColor: true,
  textColor: true,
} as const satisfies Prisma.EventPositionSelect;

export interface ManageableEventLineupOptions {
  /**
   * Skips the check of the end of the event. Only for a lineup that the
   * caller reads from, for example the source of a copy.
   */
  readonly ignoreFreeze?: boolean;
}

/** The organizers and `othersEventPosition;manage` manage the positions */
export const requirePositionManager = (
  actor: Actor,
  event: EventManageInput,
) => {
  if (!isAllowedToManagePositions(actor, event))
    throw new ForbiddenError(
      "The user cannot manage the positions of the event",
    );
};

/**
 * The guard of each change of the lineup of an event: the event exists and
 * is not deleted, it has not ended, and the actor manages its positions.
 *
 * @throws NotFoundError, ConflictError or ForbiddenError
 */
export const requireManageableEventLineup = async (
  context: ApplicationContext,
  actor: Actor,
  eventId: string,
  { ignoreFreeze = false }: ManageableEventLineupOptions = {},
) => {
  const event = await context.prisma.event.findUnique({
    where: { id: eventId, deletedAt: null },
    select: LINEUP_EVENT_SELECT,
  });
  if (!event) throw new NotFoundError(LineupErrorMessage.EventNotFound);

  if (!ignoreFreeze && !isEventUpdatable(event, context.now()))
    throw new ConflictError(LineupErrorMessage.EventEnded);

  requirePositionManager(actor, event);

  return event;
};

/**
 * A position of the lineup of an event that the actor manages, with its
 * event. A position of an event template does not exist for the use cases:
 * they change only the lineups of events.
 *
 * @throws NotFoundError, ConflictError or ForbiddenError
 */
export const requireManageableEventPosition = async (
  context: ApplicationContext,
  actor: Actor,
  positionId: string,
) => {
  const position = await context.prisma.eventPosition.findUnique({
    where: { id: positionId, eventId: { not: null } },
    select: LINEUP_POSITION_SELECT,
  });
  if (!position?.eventId)
    throw new NotFoundError(LineupErrorMessage.PositionNotFound);

  const event = await requireManageableEventLineup(
    context,
    actor,
    position.eventId,
  );

  return { position, event };
};

/**
 * A position of an event that is not deleted and that has not ended, with
 * the event. The guard of the assignment and of the applications.
 *
 * @throws NotFoundError or ConflictError
 */
export const requireUpdatableEventPosition = async (
  context: ApplicationContext,
  positionId: string,
) => {
  const position = await context.prisma.eventPosition.findUnique({
    where: { id: positionId, event: { deletedAt: null } },
    select: {
      ...LINEUP_POSITION_SELECT,
      event: { select: LINEUP_EVENT_SELECT },
    },
  });
  if (!position?.event)
    throw new NotFoundError(LineupErrorMessage.PositionNotFound);

  if (!isEventUpdatable(position.event, context.now()))
    throw new ConflictError(LineupErrorMessage.EventEnded);

  return { ...position, event: position.event };
};
