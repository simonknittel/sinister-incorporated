import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { compareRoleNames } from "./roleOutput.js";

/**
 * Whether the actor can see the role: `otherRole;read` with the id of the
 * role. The role badges, the role picker and the role tools of the MCP server
 * use this rule.
 */
export const isRoleVisible = (
  actor: Pick<Actor, "authorize">,
  roleId: string,
) => actor.authorize("otherRole", "read", [{ key: "roleId", value: roleId }]);

/**
 * Whether the actor can see at least one role: in admin mode, or with an
 * `otherRole` permission for a role id (or for all roles) that passes
 * `isRoleVisible()`. Only the permissions count, thus the result does not
 * need a query.
 */
export const canSeeAnyRole = (
  actor: Pick<Actor, "adminMode" | "authorize" | "permissionSets">,
) =>
  actor.adminMode ||
  actor.permissionSets.some(
    (permissionSet) =>
      permissionSet.resource === "otherRole" &&
      permissionSet.attributes?.some(
        (attribute) =>
          attribute.key === "roleId" &&
          typeof attribute.value === "string" &&
          isRoleVisible(actor, attribute.value),
      ),
  );

/**
 * The ids of the roles that the actor can see (see `isRoleVisible()`),
 * sorted by the name of the role like the role picker
 */
export const loadVisibleRoleIds = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Pick<Actor, "authorize">,
): Promise<string[]> => {
  const roles = await context.prisma.role.findMany({
    select: { id: true, name: true },
  });

  return roles
    .filter((role) => isRoleVisible(actor, role.id))
    .toSorted(compareRoleNames)
    .map((role) => role.id);
};
