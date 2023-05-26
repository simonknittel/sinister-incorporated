import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import { FaLock } from "react-icons/fa";
import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import AddRoles from "./AddRoles";
import Role from "./Role";

interface Props {
  entity: Entity & {
    logs: (EntityLog & {
      attributes: (EntityLogAttribute & { createdBy: User })[];
    })[];
  };
}

const Roles = async ({ entity }: Props) => {
  const authentication = await authenticate();

  const allRoles = await prisma.role.findMany();
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

  const assignedAndVisibleRoleIds = assignedAndVisibleRoles.map(
    (role) => role.id
  );

  const assignAbleRoles = allRoles
    .filter((role) => {
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
    })
    .filter((role) => {
      return (
        authentication &&
        (authentication.authorize([
          {
            resource: "otherRole",
            operation: "assign",
            attributes: [
              {
                key: "roleId",
                value: role.id,
              },
            ],
          },
        ]) ||
          authentication.authorize([
            {
              resource: "otherRole",
              operation: "dismiss",
              attributes: [
                {
                  key: "roleId",
                  value: role.id,
                },
              ],
            },
          ]))
      );
    });

  return (
    <section className="rounded p-4 lg:p-8 bg-neutral-900">
      <h2 className="font-bold flex gap-2 items-center">
        <FaLock /> Rollen
      </h2>

      {assignedAndVisibleRoles.length > 0 ? (
        <div className="flex gap-2 flex-wrap mt-4">
          {assignedAndVisibleRoles.map((role) => (
            <Role key={role.id} role={role} />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 italic mt-4">Keine Rollen</p>
      )}

      {authentication &&
        (authentication.authorize([
          {
            resource: "otherRole",
            operation: "assign",
          },
        ]) ||
          authentication.authorize([
            {
              resource: "otherRole",
              operation: "dismiss",
            },
          ])) && (
          <div className="flex gap-4 mt-2">
            <AddRoles
              entity={entity}
              allRoles={assignAbleRoles}
              assignedRoleIds={assignedAndVisibleRoleIds}
            />

            {/* <ImpersonateRoles roles={visibleRoles} /> */}
          </div>
        )}
    </section>
  );
};

export default Roles;
