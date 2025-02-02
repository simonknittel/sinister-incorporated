import { authenticatePage } from "@/auth/server";
import { getUnleashFlag } from "@/common/utils/getUnleashFlag";
import { log } from "@/logging";
import { Navigation } from "@/roles/components/Navigation";
import { PermissionsTab } from "@/roles/components/PermissionsTab";
import { getRoleById, getRoles } from "@/roles/queries";
import { getAllClassificationLevels, getAllNoteTypes } from "@/spynet/queries";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
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

  const roleId = (await params).id;
  const role = await getRoleById(roleId);
  if (!role) notFound();

  const [allRoles, noteTypes, classificationLevels] = await Promise.all([
    getRoles(true),
    getAllNoteTypes(),
    getAllClassificationLevels(),
  ]);

  const enableOperations = Boolean(await getUnleashFlag("EnableOperations"));

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Rolle /</span>
        <p>{role?.name}</p>
      </div>

      <Navigation
        role={role}
        active={`/app/roles/${roleId}/permissions`}
        className="mt-2"
      />

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
