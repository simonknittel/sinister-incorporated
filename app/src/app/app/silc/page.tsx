import { authenticatePage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { SilcBalancesTable } from "@/silc/components/SilcBalancesTable";
import { SilcStatistics } from "@/silc/components/SilcStatistics";
import { Template } from "@/silc/components/Template";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/silc");
  await authentication.authorizePage("silcBalanceOfOtherCitizen", "read");

  return (
    <Template>
      <div className="flex flex-col gap-[2px]">
        <SuspenseWithErrorBoundaryTile>
          <SilcStatistics />
        </SuspenseWithErrorBoundaryTile>

        <SuspenseWithErrorBoundaryTile>
          <SilcBalancesTable />
        </SuspenseWithErrorBoundaryTile>
      </div>
    </Template>
  );
}
