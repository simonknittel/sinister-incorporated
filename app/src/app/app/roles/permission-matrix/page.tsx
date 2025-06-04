import { authenticatePage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { PermissionMatrix } from "@/roles/components/PermissionMatrix";
import { RolesOverviewTemplate } from "@/roles/components/RolesOverviewTemplate";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Berechtigungsmatrix - Rollen | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/roles/permission-matrix");
  await authentication.authorizePage("role", "manage");

  return (
    <RolesOverviewTemplate>
      <SuspenseWithErrorBoundaryTile>
        <PermissionMatrix />
      </SuspenseWithErrorBoundaryTile>
    </RolesOverviewTemplate>
  );
}
