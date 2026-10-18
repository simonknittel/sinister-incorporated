/** The use cases of the roles group. */
export {
  getRole,
  getRoleInputSchema,
  type GetRoleInput,
  type GetRoleOutput,
} from "./getRole.js";
export {
  listRoles,
  listRolesInputSchema,
  type ListRolesInput,
  type ListRolesOutput,
} from "./listRoles.js";
export {
  canAssignRole,
  canChangeRoleAssignment,
  canDismissRole,
} from "./roleAssignmentPermissions.js";
export type { RoleOutput } from "./roleOutput.js";
export { canSeeAnyRole, isRoleVisible } from "./roleVisibility.js";
