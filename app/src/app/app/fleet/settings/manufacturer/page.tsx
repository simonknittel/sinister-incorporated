import { type Metadata } from "next";
import { Suspense } from "react";
import { authenticatePage } from "../../../../../lib/auth/server";
import { CreateManufacturereButton } from "../_components/CreateManufacturerButton";
import { ManufacturersTile } from "../_components/ManufacturersTile";
import { TileSkeleton } from "../_components/TileSkeleton";

export const metadata: Metadata = {
  title: "Hersteller - Schiffe | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage(
    "/app/fleet/settings/manufacturers",
  );
  authentication.authorizePage("manufacturersSeriesAndVariants", "manage");

  return (
    <main className="p-2 lg:p-8 pt-20">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Hersteller</h1>

        <CreateManufacturereButton />
      </div>

      <Suspense fallback={<TileSkeleton />}>
        <ManufacturersTile />
      </Suspense>
    </main>
  );
}
