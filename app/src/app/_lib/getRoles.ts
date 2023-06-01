import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
} from "@prisma/client";
import { authenticate } from "./auth/authenticateAndAuthorize";
import getAllRoles from "./cached/getAllRoles";

export default async function getRoles(
  entity: Entity & {
    logs: (EntityLog & { attributes: EntityLogAttribute[] })[];
  }
) {
  const authentication = await authenticate();

  const allRoles = await getAllRoles();
  const allRoleIds = allRoles.map((role) => role.id);

  const logs = entity.logs
    .filter((log) => ["role-added", "role-removed"].includes(log.type))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

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
    return (
      authentication &&
      authentication.authorize([
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
      ])
    );
  });

  return assignedAndVisibleRoles;
}
