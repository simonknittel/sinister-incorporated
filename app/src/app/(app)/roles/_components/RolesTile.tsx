import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { FaTable } from "react-icons/fa";
import { isOpenAIEnabled } from "../../../../_lib/isOpenAIEnabled";
import { env } from "../../../../env.mjs";
import { prisma } from "../../../../server/db";
import Actions from "../../../_components/Actions";
import { Create } from "./Create";
import Delete from "./Delete";
import Permissions from "./Permissions";
import Update from "./Update";

interface Props {
  className?: string;
}

const RolesTile = async ({ className }: Readonly<Props>) => {
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
      className={clsx(
        className,
        "max-w-4xl p-4 lg:p-8 rounded-2xl bg-neutral-800/50 ",
      )}
    >
      {sortedRoles.map((role) => (
        <div
          key={role.id}
          className="flex justify-between gap-2 py-2 items-center"
        >
          <div className="flex items-center gap-2">
            {role.imageId && (
              <div className="aspect-square w-8 h-8 flex items-center justify-center rounded overflow-hidden">
                <Image
                  src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.imageId}`}
                  alt=""
                  width={32}
                  height={32}
                  className="max-w-full max-h-full"
                />
              </div>
            )}

            <div className="flex flex-col">
              <p className="font-bold">{role.name}</p>
              <p className="text-neutral-500 text-sm whitespace-break-spaces">
                {role.id}
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <Actions>
              <Update role={role} />

              <Permissions
                role={role}
                noteTypes={noteTypes}
                classificationLevels={classificationLevels}
                allRoles={roles}
              />

              <Delete role={role} />

              <Link
                href={`/spynet/citizen?filters=role-${role.id}`}
                className="flex items-center justify-center rounded uppercase h-8 gap-2 text-xs text-sinister-red-500 hover:bg-sinisterborder-sinister-red-300 hover:text-sinister-red-300 active:text-sinister-red-300"
                prefetch={false}
              >
                <FaTable className="flex-none" />
                Citizen mit dieser Rolle
              </Link>
            </Actions>
          </div>
        </div>
      ))}

      {roles.length <= 0 && (
        <p className="text-neutral-500 italic">Keine Rollen vorhanden</p>
      )}

      <Create
        className="mt-4"
        enableSuggestions={await isOpenAIEnabled("RoleNameSuggestions")}
      />
    </section>
  );
};

export default RolesTile;
