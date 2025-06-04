import { authenticatePage } from "@/auth/server";
import { getAllFlows } from "@/career/queries";
import { getUnleashFlag } from "@/common/utils/getUnleashFlag";
import { log } from "@/logging";
import { PermissionsTab } from "@/roles/components/PermissionsTab";
import { RoleDetailsTemplate } from "@/roles/components/RoleDetailsTemplate";
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

interface Props {
  readonly params: Params;
}

export default async function Page({ params }: Props) {
  const authentication = await authenticatePage("/app/roles");
  await authentication.authorizePage("role", "manage");

  const roleId = (await params).id;
  const role = await getRoleById(roleId);
  if (!role) notFound();

  const [allRoles, noteTypes, classificationLevels, flows] = await Promise.all([
    getRoles(true),
    getAllNoteTypes(),
    getAllClassificationLevels(),
    getAllFlows(),
  ]);

  const enableOperations = Boolean(await getUnleashFlag("EnableOperations"));

  return (
    <RoleDetailsTemplate role={role}>
      <PermissionsTab
        role={role}
        allRoles={allRoles}
        noteTypes={noteTypes}
        classificationLevels={classificationLevels}
        enableOperations={enableOperations}
        flows={flows}
      />
    </RoleDetailsTemplate>
  );
}
