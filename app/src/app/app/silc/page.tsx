import { authenticatePage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { Navigation } from "@/silc/components/Navigation";
import { SilcBalancesTable } from "@/silc/components/SilcBalancesTable";
import { type Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/silc");
  await authentication.authorizePage("silcBalanceOfOtherCitizen", "read");

  return (
    <main className="p-4 pb-20 lg:p-8">
      <div className="flex justify-center">
        <Hero text="SILC" withGlitch />
      </div>

      <Navigation active="/app/silc" className="mt-4" />

      <Suspense fallback={<SkeletonTile className="mt-4" />}>
        <SilcBalancesTable className="mt-4" />
      </Suspense>
    </main>
  );
}
