import { TaskVisibility } from "@sam-monorepo/database/browser";
import type { Prisma } from "@sam-monorepo/database/client";
import type { Actor, ActorCitizen } from "../actor.js";
import { getEffectiveRolesOfCitizen } from "../auth/getEffectiveRolesOfCitizen.js";
import type { ApplicationContext } from "../context.js";
import { ForbiddenError } from "../errors.js";

/**
 * Tasks which are open at `now`: not cancelled, deleted, completed or
 * expired. The visibility is a separate fragment (see
 * `getVisibleTasksWhere`).
 */
export const getOpenTasksWhere = (now: Date): Prisma.TaskWhereInput => ({
  cancelledAt: null,
  deletedAt: null,
  completedAt: null,
  OR: [{ expiresAt: { gte: now } }, { expiresAt: null }],
});

/** The task features need a citizen: the visibility and the assignments use it */
export const requireTaskCitizen = (actor: Actor): ActorCitizen => {
  if (!actor.citizen) throw new ForbiddenError("The user has no citizen");

  return actor.citizen;
};

/**
 * The tasks the actor may see, as a Prisma where fragment. The filter is
 * part of each task query: a filter after the query would make a page or a
 * "latest 5" list shorter than its size.
 *
 * The required roles compare with the effective roles of the citizen: an
 * inherited role counts, and a role with levels counts only at its maximum
 * level.
 *
 * @param roleIds The effective roles of the citizen of the actor (see
 * `getEffectiveRolesOfCitizen`)
 */
export const getVisibleTasksWhere = (
  actor: Actor,
  roleIds: ReadonlySet<string>,
): Prisma.TaskWhereInput => {
  const citizenId = requireTaskCitizen(actor).id;

  if (actor.authorize("task", "manage")) return {};

  return {
    OR: [
      { createdById: citizenId },
      { completionists: { some: { id: citizenId } } },
      { assignments: { some: { citizenId } } },
      /**
       * A task with required roles that is hidden for other roles is
       * visible only to these roles, also if it is public.
       */
      {
        hiddenForOtherRoles: true,
        requiredRoles: { some: { id: { in: Array.from(roleIds) } } },
      },
      {
        visibility: TaskVisibility.PUBLIC,
        OR: [{ hiddenForOtherRoles: false }, { requiredRoles: { none: {} } }],
      },
    ],
  };
};

/** Loads the effective roles of the citizen and builds the visibility filter */
export const loadVisibleTasksWhere = async (
  context: ApplicationContext,
  actor: Actor,
) => {
  const citizen = requireTaskCitizen(actor);
  const { roleIds } = await getEffectiveRolesOfCitizen(
    context.prisma,
    citizen.id,
  );

  return {
    citizenId: citizen.id,
    roleIds,
    visibleTasksWhere: getVisibleTasksWhere(actor, roleIds),
  };
};
