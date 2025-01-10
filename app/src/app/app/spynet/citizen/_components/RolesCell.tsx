import { requireAuthentication } from "@/auth/server";
import { SingleRole } from "@/common/components/SingleRole";
import { getAssignedRoles } from "@/roles/utils/getRoles";
import { type Entity, type Role } from "@prisma/client";
import clsx from "clsx";
import AddRoles from "../../entity/[id]/_components/roles/AddRoles";

type Props = Readonly<{
  className?: string;
  entity: Entity;
  assignableRoles: Role[];
}>;

export const RolesCell = async ({
  className,
  entity,
  assignableRoles,
}: Props) => {
  const authentication = await requireAuthentication();

  const showUpdateRolesButton =
    (await authentication.authorize("otherRole", "assign", [
      {
        key: "roleId",
        value: "*",
      },
    ])) ||
    (await authentication.authorize("otherRole", "dismiss", [
      {
        key: "roleId",
        value: "*",
      },
    ]));

  const roles = await getAssignedRoles(entity);

  return (
    <>
      {roles.length > 0 ? (
        <div className={clsx("flex gap-2", className)}>
          {roles.map((role) => (
            <SingleRole key={role.id} role={role} />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 italic">-</p>
      )}

      {showUpdateRolesButton && assignableRoles.length > 0 && (
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
