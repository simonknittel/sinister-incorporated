import { requireAuthenticationPage } from "@/auth/server";
import { SidebarLayout } from "@/common/components/layouts/sidebar/Layout";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { Navigation } from "@/iam/components/Navigation/Navigation";
import { PermissionMatrix } from "@/roles/components/PermissionMatrix";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Berechtigungsmatrix - IAM | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage(
    "/app/iam/permission-matrix",
  );
  await authentication.authorizePage("role", "manage");

  return (
    <SidebarLayout
      title="IAM"
      sidebar={<Navigation />}
      childrenContainerClassName="overflow-x-hidden"
    >
      <SuspenseWithErrorBoundaryTile>
        <PermissionMatrix />
      </SuspenseWithErrorBoundaryTile>
    </SidebarLayout>
  );
}
