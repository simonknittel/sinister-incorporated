import { authenticatePage } from "@/auth/server";
import { CreateManufacturereButton } from "@/fleet/components/CreateManufacturerButton";
import { ManufacturersTile } from "@/fleet/components/ManufacturersTile";
import { TileSkeleton } from "@/fleet/components/TileSkeleton";
import { type Metadata } from "next";
import { Suspense } from "react";

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
