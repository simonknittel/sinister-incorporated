import { authenticatePage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { AllEntriesTable } from "@/penalty-points/components/AllEntriesTable";
import { type Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Strafpunkte | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/penalty-points");
  await authentication.authorizePage("penaltyEntry", "create");

  return (
    <main className="p-4 pb-20 lg:p-8">
      <div className="flex justify-center">
        <Hero text="Strafpunkte" withGlitch />
      </div>

      <Suspense fallback={<SkeletonTile className="mt-8" />}>
        <AllEntriesTable className="mt-8" />
      </Suspense>
    </main>
  );
}
