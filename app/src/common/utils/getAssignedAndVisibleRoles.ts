import { requireAuthentication } from "@/auth/server";
import { type Entity } from "@prisma/client";
import { cache } from "react";
import getAllRoles from "./cached/getAllRoles";

export const getAssignedAndVisibleRoles = cache(async (entity: Entity) => {
  const authentication = await requireAuthentication();

  const allRoles = await getAllRoles();
  const allRoleIds = allRoles.map((role) => role.id);

  const assignedRoleIds = entity.roles?.split(",") ?? [];

  const assignedRoles = Array.from(assignedRoleIds)
    .filter((activeRoleId) => allRoleIds.includes(activeRoleId))
    .map((roleId) => allRoles.find((role) => role.id === roleId)!)
    .sort((a, b) => a.name.localeCompare(b.name));

  const assignedAndVisibleRoles = assignedRoles.filter((role) => {
    return authentication.authorize("otherRole", "read", [
      {
        key: "roleId",
        value: role.id,
      },
    ]);
  });

  return assignedAndVisibleRoles;
});
