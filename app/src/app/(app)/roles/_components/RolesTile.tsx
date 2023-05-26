import clsx from "clsx";
import { prisma } from "~/server/db";
import Create from "./Create";
import Delete from "./Delete";
import Permissions from "./Permissions";
import Update from "./Update";

interface Props {
  className?: string;
}

const RolesTile = async ({ className }: Props) => {
  const [roles, noteTypes, classificationLevels] = await prisma.$transaction([
    prisma.role.findMany({
      include: {
        permissions: {
          include: {
            attributes: true,
          },
        },
      },
    }),

    prisma.noteType.findMany(),

    prisma.classificationLevel.findMany(),
  ]);

  const sortedRoles = roles.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section
      className={clsx(className, "max-w-4xl p-4 lg:p-8 rounded bg-neutral-900")}
    >
      {sortedRoles.map((role) => (
        <div
          key={role.id}
          className="flex justify-between gap-2 py-2 items-center"
        >
          <div className="flex flex-col">
            <p className="font-bold">{role.name}</p>
            <p className="text-neutral-500 text-sm">{role.id}</p>
          </div>

          <div className="flex gap-4 items-center">
            <Update role={role} />
            <Permissions
              role={role}
              noteTypes={noteTypes}
              classificationLevels={classificationLevels}
              allRoles={roles}
            />
            <Delete role={role} />
          </div>
        </div>
      ))}

      {roles.length <= 0 && (
        <p className="text-neutral-500 italic">Keine Rollen vorhanden</p>
      )}

      <Create className="mt-4" />
    </section>
  );
};

export default RolesTile;
