import { Algolia } from "@/algolia/components/Algolia";
import { requireAuthenticationPage } from "@/auth/server";
import { Tile } from "@/common/components/Tile";
import { log } from "@/logging";
import { AnalyticsCheckboxLoader } from "@/settings/components/AnalyticsCheckboxLoader";
import { type Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Einstellungen | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/settings");

  const [showAnalytics, showAlgolia] = await Promise.all([
    authentication.authorize("analytics", "manage"),
    authentication.authorize("algolia", "manage"),
  ]);

  if (!showAnalytics && !showAlgolia) {
    void log.info("Forbidden request to page", {
      userId: authentication.session.user.id,
      reason: "Insufficient permissions",
    });

    redirect("/app");
  }

  return (
    <main className="p-4 pb-20 lg:pb-4">
      <h1 className="font-thin text-2xl">Einstellungen</h1>

      <div className="flex flex-col gap-4 mt-4">
        {showAnalytics && (
          <Tile heading="Disable analytics">
            <p className="mb-4">Disables Vercel Analytics for this browser.</p>

            <AnalyticsCheckboxLoader />
          </Tile>
        )}

        {showAlgolia && (
          <Tile heading="Algolia">
            <Algolia />
          </Tile>
        )}
      </div>
    </main>
  );
}
