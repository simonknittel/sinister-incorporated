import { requireAuthenticationPage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { AllEntriesTable } from "@/penalty-points/components/AllEntriesTable";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Strafpunkte | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/penalty-points");
  await authentication.authorizePage("penaltyEntry", "read");

  return (
    <SuspenseWithErrorBoundaryTile>
      <AllEntriesTable />
    </SuspenseWithErrorBoundaryTile>
  );
}
