import { type Entity } from "@prisma/client";
import clsx from "clsx";
import { getAssignedAndVisibleRoles } from "~/app/_lib/getAssignedAndVisibleRoles";
import SingleRole from "./SingleRole";

interface Props {
  className?: string;
  entity?: Entity;
}

export const RolesTile = async ({ className, entity }: Readonly<Props>) => {
  if (!entity)
    return (
      <section className={clsx(className, "rounded p-4 lg:p-8 bg-neutral-900")}>
        <h2 className="font-bold mb-4">Meine Rollen</h2>
        <p className="text-neutral-500 italic">Keine Rollen</p>
      </section>
    );

  const roles = await getAssignedAndVisibleRoles(entity);

  return (
    <section className={clsx(className, "rounded p-4 lg:p-8 bg-neutral-900")}>
      <h2 className="font-bold mb-4">Meine Rollen</h2>

      {roles.length > 0 ? (
        <div className="flex gap-2 flex-wrap">
          {roles.map((role) => (
            <SingleRole key={role.id} role={role} />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 italic">Keine Rollen</p>
      )}
    </section>
  );
};
