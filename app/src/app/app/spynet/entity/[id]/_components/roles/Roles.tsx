import { requireAuthentication } from "@/auth/server";
import { getAssignableRoles } from "@/common/utils/getAssignableRoles";
import { getAssignedAndVisibleRoles } from "@/common/utils/getAssignedAndVisibleRoles";
import { type Entity } from "@prisma/client";
import clsx from "clsx";
import { FaLock } from "react-icons/fa";
import AddRoles from "./AddRoles";
import SingleRole from "./SingleRole";

type Props = Readonly<{
  className?: string;
  entity: Entity;
}>;

export const Roles = async ({ className, entity }: Props) => {
  const authentication = await requireAuthentication();

  const assignedAndVisibleRoles = await getAssignedAndVisibleRoles(entity);
  const assignedAndVisibleRoleIds = assignedAndVisibleRoles.map(
    (role) => role.id,
  );

  const assignableRoles = await getAssignableRoles();

  return (
    <section
      className={clsx(className, "rounded-2xl p-4 lg:p-8 bg-neutral-800/50")}
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

      {(authentication.authorize("otherRole", "assign", [
        {
          key: "roleId",
          value: "*",
        },
      ]) ||
        authentication.authorize("otherRole", "dismiss", [
          {
            key: "roleId",
            value: "*",
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
