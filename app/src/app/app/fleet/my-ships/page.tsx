import { requireAuthenticationPage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { MyFleetTile } from "@/fleet/components/MyFleetTile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Meine Schiffe - Flotte | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/fleet");
  await authentication.authorizePage("ship", "manage");

  return (
    <SuspenseWithErrorBoundaryTile>
      <MyFleetTile />
    </SuspenseWithErrorBoundaryTile>
  );
}
