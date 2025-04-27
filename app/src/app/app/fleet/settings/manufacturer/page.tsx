import { authenticatePage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { ManufacturersTile } from "@/fleet/components/ManufacturersTile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Hersteller - Schiffe | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage(
    "/app/fleet/settings/manufacturers",
  );
  await authentication.authorizePage(
    "manufacturersSeriesAndVariants",
    "manage",
  );

  return (
    <main>
      <SuspenseWithErrorBoundaryTile>
        <ManufacturersTile />
      </SuspenseWithErrorBoundaryTile>
    </main>
  );
}
