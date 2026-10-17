import type { Actor } from "../actor.js";

/**
 * The roles of a citizen that the actor can see: the assigned roles for
 * which the actor has `otherRole;read`. The level of an assignment does not
 * matter, like on the role badges of the app.
 */
export const getVisibleAssignedRoleIds = (
  actor: Pick<Actor, "authorize">,
  roleAssignments: readonly { readonly roleId: string }[],
) =>
  roleAssignments
    .map((roleAssignment) => roleAssignment.roleId)
    .filter((roleId) =>
      actor.authorize("otherRole", "read", [{ key: "roleId", value: roleId }]),
    );
