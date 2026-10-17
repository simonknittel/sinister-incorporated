import { prisma } from "@/db";
import { getRequestActor } from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { isRoleVisible } from "@sam-monorepo/application";
import type { RoleAssignment } from "@sam-monorepo/database/client";
import { forbidden } from "next/navigation";
import { cache } from "react";
import { getRoles } from "../queries/getRoles";

/**
 * The badge rows of the roles that the viewer can see, sorted by name. The
 * MCP tool `list_roles` uses the same rule (`isRoleVisible()`), but its
 * output does not have the upload rows that the badges render.
 */
export const getVisibleRoles = cache(
  withTrace("getVisibleRoles", async () => {
    const [actor, allRoles] = await Promise.all([
      getRequestActor(),
      getRoles(),
    ]);

    return allRoles
      .filter((role) => isRoleVisible(actor, role.id))
      .toSorted((first, second) => first.name.localeCompare(second.name));
  }),
);

/**
 * The visible roles of one citizen, each carrying that citizen's level.
 * The level comes from the citizen's own assignments, so the roles
 * themselves never have to carry an assignment row per citizen.
 */
export const getAssignedRoles = cache(
  async (entity: {
    readonly roleAssignments: readonly Pick<
      RoleAssignment,
      "roleId" | "currentLevel"
    >[];
  }) => {
    const visibleRoles = await getVisibleRoles();

    return visibleRoles.flatMap((role) => {
      const assignment = entity.roleAssignments.find(
        (assignment) => assignment.roleId === role.id,
      );
      if (!assignment) return [];

      return [{ ...role, currentLevel: assignment.currentLevel }];
    });
  },
);

/**
 * The viewer's assigned roles, each with the ids of the roles it inherits.
 * Only the career flow needs the inheritance, to mark a node unlocked when
 * the viewer reaches its role through another one — so the inherited ids
 * are fetched for these few roles instead of riding along on every role in
 * the app-wide roles context.
 */
export const getMyAssignedRolesWithInheritance = cache(
  withTrace("getMyAssignedRolesWithInheritance", async () => {
    const authentication = await requireAuthentication();
    if (!authentication.session.entity) forbidden();

    const assignedRoles = await getAssignedRoles(authentication.session.entity);

    const inheritances = await prisma.role.findMany({
      where: { id: { in: assignedRoles.map((role) => role.id) } },
      select: { id: true, inherits: { select: { id: true } } },
    });
    const inheritsByRoleId = new Map(
      inheritances.map((role) => [role.id, role.inherits]),
    );

    return assignedRoles.map((role) => ({
      ...role,
      inherits: inheritsByRoleId.get(role.id) ?? [],
    }));
  }),
);

export const getAssignableRoles = cache(
  withTrace("getAssignableRoles", async () => {
    const [authentication, visibleRoles] = await Promise.all([
      requireAuthentication(),
      getVisibleRoles(),
    ]);

    const assignableRoles = (
      await Promise.all(
        visibleRoles.map(async (role) => {
          const include =
            (await authentication.authorize("otherRole", "assign", [
              {
                key: "roleId",
                value: role.id,
              },
            ])) ||
            (await authentication.authorize("otherRole", "dismiss", [
              {
                key: "roleId",
                value: role.id,
              },
            ]));

          return {
            role,
            include,
          };
        }),
      )
    )
      .filter(({ include }) => include)
      .map(({ role }) => role)
      .sort((a, b) => a.name.localeCompare(b.name));

    return assignableRoles;
  }),
);
