import { requireAuthenticationPage } from "@/auth/server";
import { SidebarLayout } from "@/common/components/layouts/sidebar/Layout";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { MyFleetTile } from "@/fleet/components/MyFleetTile";
import { Navigation } from "@/fleet/components/Navigation/Navigation";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Meine Schiffe - Flotte | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/fleet");
  await authentication.authorizePage("ship", "manage");

  return (
    <SidebarLayout title="Flotte" sidebar={<Navigation />}>
      <SuspenseWithErrorBoundaryTile>
        <MyFleetTile />
      </SuspenseWithErrorBoundaryTile>
    </SidebarLayout>
  );
}
