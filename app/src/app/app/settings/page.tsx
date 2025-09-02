import { Algolia } from "@/algolia/components/Algolia";
import { requireAuthenticationPage } from "@/auth/server";
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
  const authentication = await requireAuthenticationPage("/app/settings");

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
    <main className="p-4 pb-20 lg:p-6">
      <h1 className="font-thin text-2xl">Einstellungen</h1>

      <div className="flex flex-col gap-4 mt-4">
        {showNoteTypes && <NoteTypesTile />}

        {showClassificationLevels && <ClassificationLevelsTile />}

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

        {showRefreshBalance && (
          <Tile heading="Other">
            <RefreshSilcBalances />
          </Tile>
        )}
      </div>
    </main>
  );
}
