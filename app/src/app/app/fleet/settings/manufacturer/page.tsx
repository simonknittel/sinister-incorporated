import { authenticatePage } from "@/auth/server";
import { type Metadata } from "next";
import { Suspense } from "react";
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
    <main>
      <div className="flex justify-end items-center">
        <CreateManufacturereButton />
      </div>

      <Suspense fallback={<TileSkeleton />}>
        <ManufacturersTile />
      </Suspense>
    </main>
  );
}
