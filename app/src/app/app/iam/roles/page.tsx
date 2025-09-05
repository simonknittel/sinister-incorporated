import { requireAuthenticationPage } from "@/auth/server";
import { Layout } from "@/common/components/layouts/sidebar/Layout";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { Navigation } from "@/iam/components/Navigation/Navigation";
import { RolesTile } from "@/roles/components/RolesTile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Rollen - IAM | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/iam/roles");
  await authentication.authorizePage("role", "manage");

  return (
    <Layout
      title="IAM"
      sidebar={<Navigation />}
      childrenContainerClassName="overflow-x-hidden"
    >
      <SuspenseWithErrorBoundaryTile>
        <RolesTile />
      </SuspenseWithErrorBoundaryTile>
    </Layout>
  );
}
