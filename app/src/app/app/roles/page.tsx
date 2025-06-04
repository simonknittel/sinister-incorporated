import { authenticatePage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { isOpenAIEnabled } from "@/common/utils/isOpenAIEnabled";
import { Create } from "@/roles/components/Create";
import { RolesOverviewTemplate } from "@/roles/components/RolesOverviewTemplate";
import { RolesTile } from "@/roles/components/RolesTile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Rollen | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/roles");
  await authentication.authorizePage("role", "manage");

  return (
    <RolesOverviewTemplate>
      <Create
        enableSuggestions={await isOpenAIEnabled("RoleNameSuggestions")}
        className="ml-auto"
      />

      <SuspenseWithErrorBoundaryTile>
        <RolesTile />
      </SuspenseWithErrorBoundaryTile>
    </RolesOverviewTemplate>
  );
}
