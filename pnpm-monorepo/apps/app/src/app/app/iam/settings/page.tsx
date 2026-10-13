import { requireAuthenticationPage } from "@/modules/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/modules/common/components/SuspenseWithErrorBoundaryTile";
import { HumanResourcesRolesSetting } from "@/modules/iam/components/HumanResourcesRolesSetting";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Einstellungen",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/iam/settings");
  await authentication.authorizePage("role", "manage");

  return (
    <SuspenseWithErrorBoundaryTile>
      <HumanResourcesRolesSetting />
    </SuspenseWithErrorBoundaryTile>
  );
}
