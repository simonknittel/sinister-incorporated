import { requireAuthenticationPage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { Tile } from "@/users/components/Tile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Benutzer - IAM | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/users");
  await authentication.authorizePage("user", "read");

  return (
    <SuspenseWithErrorBoundaryTile>
      <Tile />
    </SuspenseWithErrorBoundaryTile>
  );
}
