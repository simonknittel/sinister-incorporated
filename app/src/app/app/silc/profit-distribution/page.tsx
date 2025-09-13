import { requireAuthenticationPage } from "@/modules/auth/server";
import { SidebarLayout } from "@/modules/common/components/layouts/SidebarLayout";
import { SuspenseWithErrorBoundaryTile } from "@/modules/common/components/SuspenseWithErrorBoundaryTile";
import { ProfitDistributionCycleExcerptList } from "@/modules/silc/components/profit-distribution/ProfitDistributionCycleExcerptList";
import { ProfitDistributionCycleSidebar } from "@/modules/silc/components/profit-distribution/ProfitDistributionCycleSidebar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Gewinnausschüttung - SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page({
  searchParams,
}: PageProps<"/app/silc/profit-distribution">) {
  const authentication = await requireAuthenticationPage(
    "/app/silc/profit-distribution",
  );
  await authentication.authorizePage("profitDistributionCycle", "read");

  return (
    <SidebarLayout sidebar={<ProfitDistributionCycleSidebar />}>
      <h1 className="sr-only">Gewinnausschüttung</h1>

      <SuspenseWithErrorBoundaryTile>
        <ProfitDistributionCycleExcerptList searchParams={searchParams} />
      </SuspenseWithErrorBoundaryTile>
    </SidebarLayout>
  );
}
