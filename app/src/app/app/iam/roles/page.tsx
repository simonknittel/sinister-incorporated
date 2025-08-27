import { authenticatePage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { Template } from "@/iam/components/Template";
import { RolesTile } from "@/roles/components/RolesTile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Rollen - IAM | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/iam/roles");
  await authentication.authorizePage("role", "manage");

  return (
    <Template>
      <SuspenseWithErrorBoundaryTile>
        <RolesTile />
      </SuspenseWithErrorBoundaryTile>
    </Template>
  );
}
