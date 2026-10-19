import type { PermissionSet } from "@sam-monorepo/domain";

/**
 * The receiver of a task notification must be able to log in and to open
 * tasks. The admin flag of a user does not count: the recipient rules read
 * only the roles.
 */
export const TASK_RECEIVER_PERMISSION_SETS = [
  { resource: "login", operation: "manage" },
  { resource: "task", operation: "read" },
] as const satisfies readonly PermissionSet[];
