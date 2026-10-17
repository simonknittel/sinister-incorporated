import { EventVisibility } from "@sam-monorepo/database/browser";
import type {
  Citizen,
  Event,
  EventVisibilityRole,
  Prisma,
} from "@sam-monorepo/database/client";
import type { Actor } from "../actor.js";
import { getEffectiveRolesOfCitizen } from "../auth/getEffectiveRolesOfCitizen.js";
import type { ApplicationContext } from "../context.js";

export interface EventViewer {
  readonly citizenId: string | null;
  readonly roleIds: ReadonlySet<string>;
  readonly hasEventManage: boolean;
}

export type EventVisibilityInput = Pick<
  Event,
  "visibility" | "createdById" | "deletedAt"
> & {
  readonly visibilityRoles: readonly Pick<EventVisibilityRole, "roleId">[];
  readonly managers: readonly Pick<Citizen, "id">[];
};

/**
 * Whether a viewer may see an event. The single source of truth for event
 * visibility, mirrored by `buildVisibleEventsWhere()` for list queries:
 * soft-deleted events are invisible to everyone (no trash UI), PUBLIC events
 * are visible to every `event;read` holder (callers check that permission),
 * RESTRICTED events only to holders of a selected role plus the fixed
 * bypass tier of creator, managers and `event;manage`.
 */
export const resolveEventVisibility = (
  event: EventVisibilityInput,
  viewer: EventViewer,
): boolean => {
  if (event.deletedAt !== null) return false;

  if (viewer.hasEventManage) return true;

  if (event.visibility === EventVisibility.PUBLIC) return true;

  if (viewer.citizenId !== null) {
    if (event.createdById === viewer.citizenId) return true;

    if (event.managers.some((manager) => manager.id === viewer.citizenId))
      return true;
  }

  return event.visibilityRoles.some((visibilityRole) =>
    viewer.roleIds.has(visibilityRole.roleId),
  );
};

/**
 * Prisma where fragment matching exactly the events
 * `resolveEventVisibility()` allows for the viewer. Every event list query
 * must AND this in so no call site can forget the soft-delete or visibility
 * exclusion.
 */
export const buildVisibleEventsWhere = (
  viewer: EventViewer,
): Prisma.EventWhereInput => {
  if (viewer.hasEventManage) return { deletedAt: null };

  const memberConditions: Prisma.EventWhereInput[] =
    viewer.citizenId !== null
      ? [
          { createdById: viewer.citizenId },
          { managers: { some: { id: viewer.citizenId } } },
        ]
      : [];

  return {
    deletedAt: null,
    OR: [
      { visibility: EventVisibility.PUBLIC },
      {
        visibilityRoles: {
          some: { roleId: { in: Array.from(viewer.roleIds) } },
        },
      },
      ...memberConditions,
    ],
  };
};

/**
 * The viewer of the visibility rules. `roleIds` are the effective roles of
 * the citizen of the actor (see `getEffectiveRolesOfCitizen()`).
 */
export const toEventViewer = (
  actor: Actor,
  roleIds: ReadonlySet<string>,
): EventViewer => ({
  citizenId: actor.citizen?.id ?? null,
  roleIds,
  hasEventManage: actor.authorize("event", "manage"),
});

/**
 * Loads the effective roles of the citizen of the actor, but only when the
 * visibility rules need them: `event;manage` sees every event.
 */
export const loadEventViewer = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<EventViewer> => {
  const viewer = toEventViewer(actor, new Set());
  if (viewer.hasEventManage || !actor.citizen) return viewer;

  const { roleIds } = await getEffectiveRolesOfCitizen(
    context.prisma,
    actor.citizen.id,
  );

  return { ...viewer, roleIds };
};

/**
 * Single-event visibility check for the actor. The roles only add
 * visibility, thus the check loads them only when the event is not visible
 * without them. Callers treat a `false` as "does not exist" so restricted
 * events stay fully invisible.
 */
export const canActorSeeEvent = async (
  context: ApplicationContext,
  actor: Actor,
  event: EventVisibilityInput,
): Promise<boolean> => {
  const viewerWithoutRoles = toEventViewer(actor, new Set());
  if (resolveEventVisibility(event, viewerWithoutRoles)) return true;

  if (
    event.deletedAt !== null ||
    !actor.citizen ||
    event.visibilityRoles.length <= 0
  )
    return false;

  return resolveEventVisibility(event, await loadEventViewer(context, actor));
};
