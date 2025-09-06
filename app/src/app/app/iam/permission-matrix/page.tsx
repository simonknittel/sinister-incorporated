import { requireAuthenticationPage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
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
    <SuspenseWithErrorBoundaryTile>
      <PermissionMatrix />
    </SuspenseWithErrorBoundaryTile>
  );
}
