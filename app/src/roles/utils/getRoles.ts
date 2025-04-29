import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { withTrace } from "@/tracing/utils/withTrace";
import type { Entity } from "@prisma/client";
import { cache } from "react";
import { getRoles } from "../queries";

export const getVisibleRoles = cache(
  withTrace("getVisibleRoles", async () => {
    const authentication = await requireAuthentication();

    const allRoles = await getRoles();
    // TODO: Filter `inherits` as well
    const visibleRoles = (
      await Promise.all(
        allRoles.map(async (role) => {
          return {
            role,
            include: await authentication.authorize("otherRole", "read", [
              {
                key: "roleId",
                value: role.id,
              },
            ]),
          };
        }),
      )
    )
      .filter(({ include }) => include)
      .map(({ role }) => role)
      .sort((a, b) => a.name.localeCompare(b.name));

    return visibleRoles;
  }),
);

export const getAssignedRoles = cache(async (entity: Entity) => {
  const visibleRoles = await getVisibleRoles();

  const assignedRoleIds = entity.roles?.split(",") ?? [];
  const assignedRoles = visibleRoles.filter((role) =>
    assignedRoleIds.includes(role.id),
  );

  return assignedRoles;
});

export const getMyAssignedRoles = cache(
  withTrace("getMyAssignedRoles", async () => {
    const authentication = await requireAuthentication();

    const entity = await prisma.entity.findUnique({
      where: {
        discordId: authentication.session.discordId,
      },
    });
    if (!entity) throw new Error("Forbidden");

    return getAssignedRoles(entity);
  }),
);

export const getAssignableRoles = cache(
  withTrace("getAssignableRoles", async () => {
    const [authentication, allRoles] = await Promise.all([
      requireAuthentication(),
      getVisibleRoles(),
    ]);

    const assignableRoles = (
      await Promise.all(
        allRoles.map(async (role) => {
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
