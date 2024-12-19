import { requireAuthentication } from "@/auth/server";
import { type Entity, type Role } from "@prisma/client";
import { getAssignedAndVisibleRoles } from "../../../../../lib/getAssignedAndVisibleRoles";
import AddRoles from "../../entity/[id]/_components/roles/AddRoles";
import SingleRole from "../../entity/[id]/_components/roles/SingleRole";

interface Props {
  entity: Entity;
  assignableRoles: Role[];
}

export const RolesCell = async ({
  entity,
  assignableRoles,
}: Readonly<Props>) => {
  const authentication = await requireAuthentication();

  const showUpdateRolesButton =
    authentication.authorize("otherRole", "assign") ||
    authentication.authorize("otherRole", "dismiss");

  const roles = await getAssignedAndVisibleRoles(entity);

  return (
    <>
      {roles.length > 0 ? (
        <div className="flex gap-2">
          {roles.map((role) => (
            <SingleRole key={role.id} role={role} />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 italic">Keine</p>
      )}

      {showUpdateRolesButton && (
        <AddRoles
          entity={entity}
          allRoles={assignableRoles}
          assignedRoleIds={roles.map((role) => role.id)}
          iconOnly={true}
        />
      )}
    </>
  );
};
