import { requireAuthenticationPage } from "@/modules/auth/server";
import { SidebarLayout } from "@/modules/common/components/layouts/SidebarLayout";
import { SuspenseWithErrorBoundaryTile } from "@/modules/common/components/SuspenseWithErrorBoundaryTile";
import { getUnleashFlag } from "@/modules/common/utils/getUnleashFlag";
import { UNLEASH_FLAG } from "@/modules/common/utils/UNLEASH_FLAG";
import { ProfitDistributionCycleExcerptList } from "@/modules/profit-distribution/components/ProfitDistributionCycleExcerptList";
import { ProfitDistributionCycleSidebar } from "@/modules/profit-distribution/components/ProfitDistributionCycleSidebar";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "SINcome - SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page({
  searchParams,
}: PageProps<"/app/sincome">) {
  if (!(await getUnleashFlag(UNLEASH_FLAG.EnableProfitDistribution)))
    notFound();

  const authentication = await requireAuthenticationPage("/app/sincome");
  await authentication.authorizePage("profitDistributionCycle", "read");

  return (
    <SidebarLayout sidebar={<ProfitDistributionCycleSidebar />}>
      <h1 className="sr-only">SINcome</h1>

      <SuspenseWithErrorBoundaryTile>
        <ProfitDistributionCycleExcerptList searchParams={searchParams} />
      </SuspenseWithErrorBoundaryTile>
    </SidebarLayout>
  );
}
