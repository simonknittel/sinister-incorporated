import { requireAuthenticationPage } from "@/modules/auth/server";
import { getAllFlows } from "@/modules/career/queries";
import { getUnleashFlag } from "@/modules/common/utils/getUnleashFlag";
import { log } from "@/modules/logging";
import { PermissionsTab } from "@/modules/roles/components/PermissionsTab";
import { RoleDetailsTemplate } from "@/modules/roles/components/RoleDetailsTemplate";
import { getRoleById, getRoles } from "@/modules/roles/queries";
import {
  getAllClassificationLevels,
  getAllNoteTypes,
} from "@/modules/spynet/queries";
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

export default async function Page({
  params,
}: PageProps<"/app/roles/[id]/permissions">) {
  const authentication = await requireAuthenticationPage("/app/roles");
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
