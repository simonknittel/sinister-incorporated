import type { Actor } from "../actor.js";

/**
 * Whether the actor can give the role to a citizen: `otherRole;assign` with
 * the id of the role
 */
export const canAssignRole = (
  actor: Pick<Actor, "authorize">,
  roleId: string,
) => actor.authorize("otherRole", "assign", [{ key: "roleId", value: roleId }]);

/**
 * Whether the actor can take the role away from a citizen:
 * `otherRole;dismiss` with the id of the role
 */
export const canDismissRole = (
  actor: Pick<Actor, "authorize">,
  roleId: string,
) =>
  actor.authorize("otherRole", "dismiss", [{ key: "roleId", value: roleId }]);

/**
 * Whether the actor can give or take away the role. The role picker of a
 * citizen shows only these roles.
 */
export const canChangeRoleAssignment = (
  actor: Pick<Actor, "authorize">,
  roleId: string,
) => canAssignRole(actor, roleId) || canDismissRole(actor, roleId);
