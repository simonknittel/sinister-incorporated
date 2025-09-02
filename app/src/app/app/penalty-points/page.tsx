import { requireAuthenticationPage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { AllEntriesTable } from "@/penalty-points/components/AllEntriesTable";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Strafpunkte | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/penalty-points");
  await authentication.authorizePage("penaltyEntry", "read");

  return (
    <main className="p-4 pb-20 lg:p-6 flex flex-col gap-8">
      <div className="flex justify-center">
        <Hero text="Strafpunkte" withGlitch size="md" />
      </div>

      <SuspenseWithErrorBoundaryTile>
        <AllEntriesTable />
      </SuspenseWithErrorBoundaryTile>
    </main>
  );
}
