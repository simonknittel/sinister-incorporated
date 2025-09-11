import { requireAuthenticationPage } from "@/modules/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/modules/common/components/SuspenseWithErrorBoundaryTile";
import { ProfitDistributionCycleExcerptList } from "@/modules/silc/components/ProfitDistributionCycleExcerptList";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Gewinnausschüttung - SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage(
    "/app/silc/profit-distribution",
  );
  await authentication.authorizePage("profitDistributionCycle", "read");

  return (
    <SuspenseWithErrorBoundaryTile>
      <ProfitDistributionCycleExcerptList />
    </SuspenseWithErrorBoundaryTile>
  );
}
