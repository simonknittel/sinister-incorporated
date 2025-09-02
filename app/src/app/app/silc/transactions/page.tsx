import { requireAuthenticationPage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { AllSilcTransactionsTable } from "@/silc/components/AllSilcTransactionsTable";
import { Template } from "@/silc/components/Template";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Transaktionen - SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage(
    "/app/silc/transactions",
  );
  await authentication.authorizePage("silcTransactionOfOtherCitizen", "read");

  return (
    <Template>
      <SuspenseWithErrorBoundaryTile>
        <AllSilcTransactionsTable />
      </SuspenseWithErrorBoundaryTile>
    </Template>
  );
}
