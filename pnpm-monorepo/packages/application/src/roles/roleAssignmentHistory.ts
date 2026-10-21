import type {
  Prisma,
  RoleAssignmentChangeType,
  RoleAssignmentLevelChangeType,
} from "@sam-monorepo/database/client";
import {
  buildCursorConditions,
  cursorOrderBy,
  type MergedCursorSourceInput,
} from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import { CITIZEN_REFERENCE_SELECT } from "../citizenReference.js";
import type { ApplicationContext } from "../context.js";
import { loadVisibleRoleIds } from "./roleVisibility.js";

const ROLE_ASSIGNMENT_CHANGE_SELECT = {
  id: true,
  roleId: true,
  type: true,
  createdAt: true,
  citizen: { select: CITIZEN_REFERENCE_SELECT },
  createdBy: { select: CITIZEN_REFERENCE_SELECT },
} as const satisfies Prisma.RoleAssignmentChangeSelect;

/** One page request of an activity source of the role history */
export interface RoleAssignmentHistoryInput extends MergedCursorSourceInput {
  /** The key of the source in the merged cursor */
  readonly sourceKey: string;
  /** Only the history of this citizen */
  readonly citizenId?: string;
  /** Only the changes of these citizens. Null or nothing: all citizens. */
  readonly actorIds?: readonly string[] | null;
  readonly createdAt?: { readonly gte?: Date; readonly lt?: Date };
}

interface HistoryCitizen {
  readonly id: string;
  readonly handle: string | null;
  readonly deletedAt: Date | null;
}

interface RoleAssignmentHistoryRow<ChangeType> {
  readonly id: string;
  readonly roleId: string;
  readonly type: ChangeType;
  readonly createdAt: Date;
  /** The citizen who got or lost the role or the level */
  readonly citizen: HistoryCitizen;
  /** Null for an automation */
  readonly createdBy: HistoryCitizen | null;
}

export type RoleAssignmentChangeRow =
  RoleAssignmentHistoryRow<RoleAssignmentChangeType>;

export type RoleAssignmentLevelChangeRow =
  RoleAssignmentHistoryRow<RoleAssignmentLevelChangeType>;

/**
 * The conditions that both role sources share. The roles that the actor can
 * see are the whole permission check. They are a part of the query, thus a
 * page never has fewer entries than it can show.
 */
const buildWhere = (
  visibleRoleIds: string[],
  {
    citizenId,
    actorIds,
    createdAt,
    position,
    sourceKey,
    direction,
  }: RoleAssignmentHistoryInput,
) => ({
  AND: [
    {
      roleId: { in: visibleRoleIds },
      ...(citizenId ? { citizenId } : {}),
      ...(actorIds ? { createdById: { in: [...actorIds] } } : {}),
      ...(createdAt && Object.keys(createdAt).length > 0 ? { createdAt } : {}),
    },
    ...buildCursorConditions(position, sourceKey, direction, "createdAt"),
  ],
});

/**
 * One page of the role assignments and removals of the roles that the actor
 * can see (see `isRoleVisible()`). Empty when the actor cannot see a role.
 */
export const findRoleAssignmentChanges = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Pick<Actor, "authorize">,
  input: RoleAssignmentHistoryInput,
): Promise<RoleAssignmentChangeRow[]> => {
  const visibleRoleIds = await loadVisibleRoleIds(context, actor);
  if (visibleRoleIds.length <= 0) return [];

  return context.prisma.roleAssignmentChange.findMany({
    where: buildWhere(visibleRoleIds, input),
    orderBy: cursorOrderBy(input.direction, "createdAt"),
    take: input.take,
    select: ROLE_ASSIGNMENT_CHANGE_SELECT,
  });
};

/**
 * One page of the level changes of the roles that the actor can see (see
 * `isRoleVisible()`). Empty when the actor cannot see a role.
 */
export const findRoleAssignmentLevelChanges = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Pick<Actor, "authorize">,
  input: RoleAssignmentHistoryInput,
): Promise<RoleAssignmentLevelChangeRow[]> => {
  const visibleRoleIds = await loadVisibleRoleIds(context, actor);
  if (visibleRoleIds.length <= 0) return [];

  return context.prisma.roleAssignmentLevelChange.findMany({
    where: buildWhere(visibleRoleIds, input),
    orderBy: cursorOrderBy(input.direction, "createdAt"),
    take: input.take,
    select: ROLE_ASSIGNMENT_CHANGE_SELECT,
  });
};
