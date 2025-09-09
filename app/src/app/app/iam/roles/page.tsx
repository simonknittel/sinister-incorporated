import { requireAuthenticationPage } from "@/auth/server";
import { MaxWidthContent } from "@/common/components/layouts/MaxWidthContent";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { RolesTile } from "@/roles/components/RolesTile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Rollen - IAM | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/iam/roles");
  await authentication.authorizePage("role", "manage");

  return (
    <MaxWidthContent>
      <SuspenseWithErrorBoundaryTile>
        <RolesTile />
      </SuspenseWithErrorBoundaryTile>
    </MaxWidthContent>
  );
}
