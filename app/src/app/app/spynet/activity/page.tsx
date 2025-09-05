import { requireAuthenticationPage } from "@/auth/server";
import { SidebarLayout } from "@/common/components/layouts/sidebar/Layout";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { ActivityTile } from "@/spynet/components/ActivityTile/ActivityTile";
import { Navigation } from "@/spynet/components/Navigation/Navigation";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Aktivität - Spynet | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage(
    "/app/spynet/activity",
  );
  await authentication.authorizePage("spynetActivity", "read");

  return (
    <SidebarLayout title="Spynet" sidebar={<Navigation />}>
      <SuspenseWithErrorBoundaryTile>
        <ActivityTile />
      </SuspenseWithErrorBoundaryTile>
    </SidebarLayout>
  );
}
