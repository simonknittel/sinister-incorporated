import { Algolia } from "@/algolia/components/Algolia";
import { authenticatePage } from "@/auth/server";
import { Tile } from "@/common/components/Tile";
import { log } from "@/logging";
import { AnalyticsCheckboxLoader } from "@/settings/components/AnalyticsCheckboxLoader";
import { RefreshSilcBalances } from "@/silc/components/RefreshSilcBalances";
import ClassificationLevelsTile from "@/spynet/components/classification-level/ClassificationLevelsTile";
import NoteTypesTile from "@/spynet/components/note-type/NoteTypesTile";
import { type Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Einstellungen | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/settings");

  const [
    showNoteTypes,
    showClassificationLevels,
    showAnalytics,
    showAlgolia,
    showRefreshBalance,
  ] = await Promise.all([
    authentication.authorize("noteType", "manage"),
    authentication.authorize("classificationLevel", "manage"),
    authentication.authorize("analytics", "manage"),
    authentication.authorize("algolia", "manage"),
    authentication.authorize("silcBalanceOfOtherCitizen", "manage"),
  ]);

  if (
    !showNoteTypes &&
    !showClassificationLevels &&
    !showAnalytics &&
    !showAlgolia
  ) {
    void log.info("Forbidden request to page", {
      userId: authentication.session.user.id,
      reason: "Insufficient permissions",
    });

    redirect("/");
  }

  return (
    <main className="p-4 pb-20 lg:p-8">
      <h1 className="font-thin text-2xl">Einstellungen</h1>

      {showNoteTypes && <NoteTypesTile className="mt-4" />}

      {showClassificationLevels && (
        <ClassificationLevelsTile className="mt-4" />
      )}

      {showAnalytics && (
        <Tile heading="Disable analytics" className="mt-4">
          <p className="mt-4 mb-4">
            Disables Vercel Analytics for this browser.
          </p>

          <AnalyticsCheckboxLoader />
        </Tile>
      )}

      {showAlgolia && (
        <Tile heading="Algolia" className="mt-4">
          <Algolia />
        </Tile>
      )}

      {showRefreshBalance && (
        <Tile heading="Other" className="mt-4">
          <RefreshSilcBalances />
        </Tile>
      )}
    </main>
  );
}
