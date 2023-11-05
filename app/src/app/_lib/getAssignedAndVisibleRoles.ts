import { type Entity } from "@prisma/client";
import { cache } from "react";
import { prisma } from "~/server/db";
import { authenticate } from "./auth/authenticateAndAuthorize";
import getAllRoles from "./cached/getAllRoles";

export const getAssignedAndVisibleRoles = cache(async (entity: Entity) => {
  const authentication = await authenticate();
  if (!authentication) return [];

  const allRoles = await getAllRoles();
  const allRoleIds = allRoles.map((role) => role.id);

  const logs = await prisma.entityLog.findMany({
    where: {
      entityId: entity.id,
      type: {
        in: ["role-added", "role-removed"],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const assignedRoleIds = new Set<string>();
  for (const log of logs) {
    if (!log.content) continue;

    if (log.type === "role-added") {
      assignedRoleIds.add(log.content);
    } else if (log.type === "role-removed") {
      assignedRoleIds.delete(log.content);
    }
  }
  const assignedRoles = Array.from(assignedRoleIds)
    .filter((activeRoleId) => allRoleIds.includes(activeRoleId))
    .map((roleId) => allRoles.find((role) => role.id === roleId)!)
    .sort((a, b) => a.name.localeCompare(b.name));

  const assignedAndVisibleRoles = assignedRoles.filter((role) => {
    return authentication.authorize([
      {
        resource: "otherRole",
        operation: "read",
        attributes: [
          {
            key: "roleId",
            value: role.id,
          },
        ],
      },
    ]);
  });

  return assignedAndVisibleRoles;
});
