import { authenticatePage } from "@/auth/server";
import { Link } from "@/common/components/Link";
import { dedupedGetUnleashFlag } from "@/common/utils/getUnleashFlag";
import { log } from "@/logging";
import { PermissionsTab } from "@/roles/components/PermissionsTab";
import { getRoleById, getRoles } from "@/roles/queries";
import { getAllClassificationLevels, getAllNoteTypes } from "@/spynet/queries";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { FaHome, FaLock, FaUsers } from "react-icons/fa";
import { serializeError } from "serialize-error";

type Params = Promise<{
  id: string;
}>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  try {
    const role = await getRoleById((await props.params).id);

    return {
      title: `${role?.name} - Rollen | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
      "Error while generating metadata for /app/roles/[id]/permissions/page.tsx",
      {
        error: serializeError(error),
      },
    );

    return {
      title: `Error | S.A.M. - Sinister Incorporated`,
    };
  }
}

type Props = Readonly<{
  params: Params;
}>;

export default async function Page({ params }: Props) {
  const authentication = await authenticatePage("/app/roles");
  await authentication.authorizePage("role", "manage");

  const role = await getRoleById((await params).id);
  if (!role) notFound();

  const [allRoles, noteTypes, classificationLevels] = await Promise.all([
    getRoles(true),
    getAllNoteTypes(),
    getAllClassificationLevels(),
  ]);

  const enableOperations = Boolean(
    await dedupedGetUnleashFlag("EnableOperations"),
  );

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Rolle /</span>
        <p>{role?.name}</p>
      </div>

      <div className="flex flex-wrap mt-2">
        <Link
          href={`/app/roles/${role.id}`}
          className="first:rounded-l border-[1px] border-sinister-red-500 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300"
        >
          <FaHome />
          Übersicht
        </Link>

        <Link
          href={`/app/roles/${role.id}/permissions`}
          className="first:rounded-l border-[1px] border-sinister-red-500 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase bg-sinister-red-500 text-white"
        >
          <FaLock />
          Berechtigungen
        </Link>

        <Link
          href={`/app/spynet/citizen?filters=role-${role.id}`}
          className="first:rounded-l border-[1px] border-sinister-red-500 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300"
        >
          <FaUsers />
          Citizen
        </Link>
      </div>

      <PermissionsTab
        role={role}
        allRoles={allRoles}
        noteTypes={noteTypes}
        classificationLevels={classificationLevels}
        enableOperations={enableOperations}
        className="mt-4"
      />
    </main>
  );
}
