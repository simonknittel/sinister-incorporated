import type { Prisma } from "@sam-monorepo/database/client";
import { ACTIVE_CITIZEN_WHERE, hasReachedMaxLevel } from "@sam-monorepo/domain";

/**
 * The role assignments that can get a salary: only the direct assignments
 * of citizens that are not deleted, not the inherited roles (decision of
 * 2026-09-27)
 */
export const SALARY_ASSIGNMENTS_ARGS = {
  where: { citizen: ACTIVE_CITIZEN_WHERE },
  select: { citizenId: true, currentLevel: true },
} as const satisfies Prisma.Role$assignmentsArgs;

/**
 * The assignments of `SALARY_ASSIGNMENTS_ARGS` that get the salary of the
 * role. A role with levels pays only at its maximum level, the same level
 * gate as for the permissions.
 */
export const getPaidAssignments = <
  Assignment extends { readonly currentLevel: number | null },
>(role: {
  readonly maxLevel: number | null;
  readonly assignments: readonly Assignment[];
}): Assignment[] =>
  role.assignments.filter((assignment) =>
    hasReachedMaxLevel({ currentLevel: assignment.currentLevel, role }),
  );
