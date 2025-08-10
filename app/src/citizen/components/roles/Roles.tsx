import { requireAuthentication } from "@/auth/server";
import { Tile } from "@/common/components/Tile";
import { SingleRole } from "@/roles/components/SingleRole";
import { getAssignableRoles, getAssignedRoles } from "@/roles/utils/getRoles";
import { type Entity } from "@prisma/client";
import clsx from "clsx";
import { AddRoles } from "./AddRoles";

interface Props {
  readonly className?: string;
  readonly entity: Entity;
}

export const Roles = async ({ className, entity }: Props) => {
  const authentication = await requireAuthentication();

  const assignedAndVisibleRoles = await getAssignedRoles(entity);
  const assignedAndVisibleRoleIds = assignedAndVisibleRoles.map(
    (role) => role.id,
  );

  const assignableRoles = await getAssignableRoles();

  let showAddRoles = false;
  for (const role of assignableRoles) {
    if (
      !(await authentication.authorize("otherRole", "assign", [
        {
          key: "roleId",
          value: role.id,
        },
      ])) &&
      !(await authentication.authorize("otherRole", "dismiss", [
        {
          key: "roleId",
          value: role.id,
        },
      ]))
    )
      continue;

    showAddRoles = true;
    break;
  }

  return (
    <Tile heading="Rollen" className={clsx(className)}>
      {assignedAndVisibleRoles.length > 0 ? (
        <div className="flex gap-1 flex-wrap">
          {assignedAndVisibleRoles.map((role) => (
            <SingleRole key={role.id} role={role} />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 italic">Keine Rollen</p>
      )}

      {showAddRoles && (
        <div className="flex gap-4 mt-2">
          <AddRoles
            entity={entity}
            allRoles={assignableRoles}
            assignedRoleIds={assignedAndVisibleRoleIds}
          />

          {/* <ImpersonateRoles roles={visibleRoles} /> */}
        </div>
      )}
    </Tile>
  );
};
