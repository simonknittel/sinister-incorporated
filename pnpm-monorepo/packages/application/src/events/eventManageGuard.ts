import type { Prisma } from "@sam-monorepo/database/client";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ForbiddenError } from "../errors.js";
import { EventConflict, EventConflictError } from "./eventErrors.js";
import { isEventUpdatable, type EventManageInput } from "./eventManageRules.js";

/**
 * Exactly what the event management guard decides on: the freeze window
 * (`isEventUpdatable`) and the manage tier (`isAllowedToManageEvent` /
 * `isAllowedToManagePositions`).
 *
 * Writes that need more than the guard spread this and add their own fields,
 * so no guard call site has to fetch full manager Citizen rows again.
 */
export const EVENT_MANAGE_GUARD_SELECT = {
  id: true,
  startTime: true,
  endTime: true,
  discordCreatorId: true,
  createdById: true,
  managers: { select: { id: true } },
} as const satisfies Prisma.EventSelect;

/**
 * The guard fields plus the fields of `canActorSeeEvent()`. A write that
 * gives the event in its output checks the visibility too, thus a rule
 * without the visibility (for example `othersEventPosition;manage`) cannot
 * reveal a restricted event.
 */
export const VISIBLE_EVENT_MANAGE_GUARD_SELECT = {
  ...EVENT_MANAGE_GUARD_SELECT,
  visibility: true,
  deletedAt: true,
  visibilityRoles: { select: { roleId: true } },
} as const satisfies Prisma.EventSelect;

type ManageGuardEvent = EventManageInput &
  Prisma.EventGetPayload<{ select: typeof EVENT_MANAGE_GUARD_SELECT }>;

/**
 * Throws when the event ended (nothing of it can change then) or when the
 * rule does not let the actor manage it
 */
export const requireManageableEvent = (
  context: ApplicationContext,
  actor: Actor,
  event: ManageGuardEvent,
  isAllowed: (actor: Actor, event: ManageGuardEvent) => boolean,
) => {
  if (!isEventUpdatable(event, context.now()))
    throw new EventConflictError(EventConflict.EventEnded);

  if (!isAllowed(actor, event))
    throw new ForbiddenError("The user cannot manage the event");
};
