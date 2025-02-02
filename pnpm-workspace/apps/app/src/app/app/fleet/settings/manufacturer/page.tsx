import { authenticatePage } from "@/auth/server";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { CreateManufacturereButton } from "@/fleet/components/CreateManufacturerButton";
import { ManufacturersTile } from "@/fleet/components/ManufacturersTile";
import { type Metadata } from "next";
import { Suspense } from "react";

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
      <div className="flex justify-end items-center">
        <CreateManufacturereButton />
      </div>

      <Suspense fallback={<SkeletonTile />}>
        <ManufacturersTile />
      </Suspense>
    </main>
  );
}
