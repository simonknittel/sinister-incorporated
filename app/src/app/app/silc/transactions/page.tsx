import { authenticatePage } from "@/auth/server";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { AllSilcTransactionsTable } from "@/silc/components/AllSilcTransactionsTable";
import { Template } from "@/silc/components/Template";
import { type Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Transaktionen - SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/silc/transactions");
  await authentication.authorizePage("silcTransactionOfOtherCitizen", "read");

  return (
    <Template>
      <Suspense fallback={<SkeletonTile />}>
        <AllSilcTransactionsTable />
      </Suspense>
    </Template>
  );
}
