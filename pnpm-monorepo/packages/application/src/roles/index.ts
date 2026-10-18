/** The use cases of the roles group. */
export {
  changeRoleAssignmentLevelInputSchema,
  decreaseRoleAssignmentLevel,
  increaseRoleAssignmentLevel,
  type ChangeRoleAssignmentLevelInput,
  type ChangeRoleAssignmentLevelOutput,
} from "./changeRoleAssignmentLevel.js";
export {
  createRole,
  createRoleInputSchema,
  type CreateRoleInput,
  type CreateRoleOutput,
} from "./createRole.js";
export { deletePermissionStringsReferencing } from "./deletePermissionStringsReferencing.js";
export {
  deleteRole,
  deleteRoleInputSchema,
  type DeleteRoleInput,
  type DeleteRoleOutput,
} from "./deleteRole.js";
export {
  deleteRoleAssignment,
  deleteRoleAssignmentInputSchema,
  type DeleteRoleAssignmentInput,
  type DeleteRoleAssignmentOutput,
} from "./deleteRoleAssignment.js";
export { findManagedRole, type ManagedRole } from "./findManagedRole.js";
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
  findInheritanceMatrixRoles,
  findPermissionMatrixRoles,
  findRoleTableRows,
  type InheritanceMatrixRole,
  type PermissionMatrixRole,
  type RoleIcon,
  type RoleTableRow,
} from "./roleAdministrationRows.js";
export {
  findRoleAssignmentChanges,
  findRoleAssignmentLevelChanges,
  type RoleAssignmentChangeRow,
  type RoleAssignmentHistoryInput,
  type RoleAssignmentLevelChangeRow,
} from "./roleAssignmentHistory.js";
export {
  canAssignRole,
  canChangeRoleAssignment,
  canDismissRole,
} from "./roleAssignmentPermissions.js";
export {
  findAllRoleBadges,
  findAssignableRoleBadges,
  findOwnAssignedRoleBadges,
  findVisibleRoleBadges,
  type OwnAssignedRoleBadge,
  type RoleBadge,
} from "./roleBadges.js";
export { RoleAssignmentErrorMessage, RoleErrorMessage } from "./roleErrors.js";
export type { RoleOutput } from "./roleOutput.js";
export { canSeeAnyRole, isRoleVisible } from "./roleVisibility.js";
export {
  setRoleInheritance,
  setRoleInheritanceInputSchema,
  type SetRoleInheritanceInput,
  type SetRoleInheritanceOutput,
} from "./setRoleInheritance.js";
export {
  setRolePermission,
  setRolePermissionInputSchema,
  type SetRolePermissionInput,
  type SetRolePermissionOutput,
} from "./setRolePermission.js";
export {
  updateRole,
  updateRoleInputSchema,
  type UpdateRoleInput,
  type UpdateRoleOutput,
} from "./updateRole.js";
export {
  updateRoleAssignments,
  updateRoleAssignmentsInputSchema,
  type RoleAssignmentUpdate,
  type UpdateRoleAssignmentsInput,
  type UpdateRoleAssignmentsOutput,
} from "./updateRoleAssignments.js";
export {
  updateRoleInheritance,
  updateRoleInheritanceInputSchema,
  type UpdateRoleInheritanceInput,
  type UpdateRoleInheritanceOutput,
} from "./updateRoleInheritance.js";
export {
  updateRolePermissions,
  updateRolePermissionsInputSchema,
  type UpdateRolePermissionsInput,
  type UpdateRolePermissionsOutput,
} from "./updateRolePermissions.js";
