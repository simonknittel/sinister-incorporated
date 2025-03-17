import { authenticatePage } from "@/auth/server";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { SilcBalancesTable } from "@/silc/components/SilcBalancesTable";
import { SilcStatistics } from "@/silc/components/SilcStatistics";
import { Template } from "@/silc/components/Template";
import { type Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/silc");
  await authentication.authorizePage("silcBalanceOfOtherCitizen", "read");

  return (
    <Template>
      <Suspense fallback={<SkeletonTile />}>
        <SilcStatistics />
      </Suspense>

      <Suspense fallback={<SkeletonTile className="mt-4" />}>
        <SilcBalancesTable className="mt-4" />
      </Suspense>
    </Template>
  );
}
