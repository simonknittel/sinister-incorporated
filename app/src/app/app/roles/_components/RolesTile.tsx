import { Actions } from "@/common/components/Actions";
import { dedupedGetUnleashFlag } from "@/common/utils/getUnleashFlag";
import { isOpenAIEnabled } from "@/common/utils/isOpenAIEnabled";
import { prisma } from "@/db";
import { env } from "@/env";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { FaTable } from "react-icons/fa";
import { Create } from "./Create";
import Delete from "./Delete";
import { Permissions } from "./Permissions";
import { PermissionsProvider } from "./PermissionsContext";
import Update from "./Update";

type Props = Readonly<{
  className?: string;
}>;

export const RolesTile = async ({ className }: Props) => {
  const [roles, noteTypes, classificationLevels] = await prisma.$transaction([
    prisma.role.findMany({
      include: {
        permissionStrings: true,
      },
    }),

    prisma.noteType.findMany(),

    prisma.classificationLevel.findMany(),
  ]);

  const sortedRoles = roles.toSorted((a, b) => a.name.localeCompare(b.name));

  const enableOperations = await dedupedGetUnleashFlag("EnableOperations");

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

              <PermissionsProvider role={role}>
                <Permissions
                  noteTypes={noteTypes}
                  classificationLevels={classificationLevels}
                  allRoles={roles}
                  enableOperations={Boolean(enableOperations)}
                />
              </PermissionsProvider>

              <Delete role={role} />

              <Link
                href={`/app/spynet/citizen?filters=role-${role.id}`}
                className="flex items-center justify-center rounded uppercase h-8 gap-2 text-xs text-sinister-red-500 hover:bg-sinisterborder-sinister-red-300 hover:text-sinister-red-300 active:text-sinister-red-300"
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
