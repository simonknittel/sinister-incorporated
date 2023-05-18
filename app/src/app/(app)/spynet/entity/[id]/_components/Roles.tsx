import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import { FaLock } from "react-icons/fa";
import { authenticateAndAuthorize } from "~/app/_utils/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import AddRoles from "./AddRoles";
import ImpersonateRoles from "./ImpersonateRoles";
import Role from "./Role";

interface Props {
  entity: Entity & {
    logs: (EntityLog & {
      attributes: (EntityLogAttribute & { createdBy: User })[];
    })[];
  };
}

const Roles = async ({ entity }: Props) => {
  const allCurrentlyExistingRoles = await prisma.role.findMany();
  const allCurrentlyExitingRoleIds = allCurrentlyExistingRoles.map(
    (role) => role.id
  );

  const logs = entity.logs
    .filter((log) => ["role-added", "role-removed"].includes(log.type))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const activeRoleIds = new Set<string>();
  for (const log of logs) {
    if (!log.content) continue;

    if (log.type === "role-added") {
      activeRoleIds.add(log.content);
    } else if (log.type === "role-removed") {
      activeRoleIds.delete(log.content);
    }
  }
  const activeRoles = Array.from(activeRoleIds)
    .filter((activeRoleId) => allCurrentlyExitingRoleIds.includes(activeRoleId))
    .map(
      (roleId) => allCurrentlyExistingRoles.find((role) => role.id === roleId)!
    );

  return (
    <section className="rounded p-4 lg:p-8 bg-neutral-900">
      <h2 className="font-bold flex gap-2 items-center">
        <FaLock /> Rollen
      </h2>

      {activeRoles.length > 0 ? (
        <div className="flex gap-2 flex-wrap mt-4">
          {activeRoles.map((role) => (
            <Role key={role.id} role={role} />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 italic mt-4">Keine Rollen</p>
      )}

      {(await authenticateAndAuthorize("edit-roles-and-permissions")) && (
        <div className="flex gap-4 mt-2">
          <AddRoles
            entity={entity}
            roles={allCurrentlyExistingRoles}
            activeRolesIds={Array.from(activeRoleIds)}
          />

          <ImpersonateRoles roles={activeRoles} />
        </div>
      )}
    </section>
  );
};

export default Roles;
