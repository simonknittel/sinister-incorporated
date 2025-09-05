import { requireAuthenticationPage } from "@/auth/server";
import { Layout } from "@/common/components/layouts/sidebar/Layout";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { Navigation } from "@/iam/components/Navigation/Navigation";
import { Tile } from "@/users/components/Tile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Benutzer - IAM | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/users");
  await authentication.authorizePage("user", "read");

  return (
    <Layout
      title="IAM"
      sidebar={<Navigation />}
      childrenContainerClassName="overflow-x-hidden"
    >
      <SuspenseWithErrorBoundaryTile>
        <Tile />
      </SuspenseWithErrorBoundaryTile>
    </Layout>
  );
}
