import { type Entity } from "@prisma/client";
import { FaLock } from "react-icons/fa";
import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import { getAssignableRoles } from "~/app/_lib/getAssignableRoles";
import { getAssignedAndVisibleRoles } from "~/app/_lib/getAssignedAndVisibleRoles";
import AddRoles from "./AddRoles";
import SingleRole from "./SingleRole";

interface Props {
  entity: Entity;
}

const Roles = async ({ entity }: Readonly<Props>) => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const assignedAndVisibleRoles = await getAssignedAndVisibleRoles(entity);
  const assignedAndVisibleRoleIds = assignedAndVisibleRoles.map(
    (role) => role.id,
  );

  const assignableRoles = await getAssignableRoles();

  return (
    <section
      className="rounded p-4 lg:p-8 bg-neutral-900"
      style={{
        gridArea: "roles",
      }}
    >
      <h2 className="font-bold flex gap-2 items-center">
        <FaLock /> Rollen
      </h2>

      {assignedAndVisibleRoles.length > 0 ? (
        <div className="flex gap-2 flex-wrap mt-4">
          {assignedAndVisibleRoles.map((role) => (
            <SingleRole key={role.id} role={role} />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 italic mt-4">Keine Rollen</p>
      )}

      {(authentication.authorize([
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
            allRoles={assignableRoles}
            assignedRoleIds={assignedAndVisibleRoleIds}
          />

          {/* <ImpersonateRoles roles={visibleRoles} /> */}
        </div>
      )}
    </section>
  );
};

export default Roles;
