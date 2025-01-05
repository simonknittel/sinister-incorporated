import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { type Entity } from "@prisma/client";
import { cache } from "react";
import { getAllRoles } from "./cached/getAllRoles";

export const getMyAssignedAndVisibleRoles = cache(async () => {
  const authentication = await requireAuthentication();

  const entity = await prisma.entity.findUnique({
    where: {
      discordId: authentication.session.discordId,
    },
  });

  if (!entity) throw new Error("Forbidden");

  return getAssignedAndVisibleRoles(entity);
});

export const getAssignedAndVisibleRoles = cache(async (entity: Entity) => {
  const authentication = await requireAuthentication();

  const allRoles = await getAllRoles();
  const allRoleIds = allRoles.map((role) => role.id);

  const assignedRoleIds = entity.roles?.split(",") ?? [];

  const assignedRoles = Array.from(assignedRoleIds)
    .filter((activeRoleId) => allRoleIds.includes(activeRoleId))
    .map((roleId) => allRoles.find((role) => role.id === roleId)!)
    .sort((a, b) => a.name.localeCompare(b.name));

  const assignedAndVisibleRoles = (
    await Promise.all(
      assignedRoles.map(async (role) => {
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
    .map(({ role }) => role);

  return assignedAndVisibleRoles;
});
