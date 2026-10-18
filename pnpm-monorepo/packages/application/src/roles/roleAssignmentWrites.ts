import type {
  Prisma,
  RoleAssignmentChangeType,
} from "@sam-monorepo/database/client";

export interface NewRoleAssignmentChange {
  readonly citizenId: string;
  readonly roleId: string;
  readonly type: RoleAssignmentChangeType;
}

/**
 * Writes one row of the role-assignment history for each change. Write the
 * rows in the transaction of the assignments, thus a failed assignment
 * writes no history.
 *
 * `createdById` is the citizen of the actor, or null for an automation.
 *
 * The function is not `async`: it gives the `PrismaPromise`, thus a batch
 * `$transaction([...])` accepts it, and an interactive transaction awaits it.
 */
export const createRoleAssignmentChanges = (
  client: Pick<Prisma.TransactionClient, "roleAssignmentChange">,
  changes: readonly NewRoleAssignmentChange[],
  createdById: string | null,
) =>
  client.roleAssignmentChange.createMany({
    data: changes.map(({ citizenId, roleId, type }) => ({
      citizenId,
      roleId,
      type,
      createdById,
    })),
  });
