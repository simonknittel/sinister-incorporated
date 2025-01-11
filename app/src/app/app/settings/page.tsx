import { Algolia } from "@/algolia/components/Algolia";
import { authenticatePage } from "@/auth/server";
import { log } from "@/logging";
import { AnalyticsCheckboxLoader } from "@/settings/components/AnalyticsCheckboxLoader";
import ClassificationLevelsTile from "@/spynet/components/classification-level/ClassificationLevelsTile";
import NoteTypesTile from "@/spynet/components/note-type/NoteTypesTile";
import { type Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Einstellungen | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/settings");

  const showNoteTypes = await authentication.authorize("noteType", "manage");
  const showClassificationLevels = await authentication.authorize(
    "classificationLevel",
    "manage",
  );
  const showAnalytics = await authentication.authorize("analytics", "manage");
  const showAlgolia = await authentication.authorize("algolia", "manage");

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
      <h1 className="text-xl font-bold">Einstellungen</h1>

      {showNoteTypes && <NoteTypesTile className="mt-4" />}

      {showClassificationLevels && (
        <ClassificationLevelsTile className="mt-4" />
      )}

      {showAnalytics && (
        <section className="mt-4 max-w-4xl p-4 lg:p-8 rounded-2xl bg-neutral-800/50">
          <h2 className="font-bold text-xl">Disable analytics</h2>

          <p className="mt-4 mb-4">
            Disables Vercel Analytics for this browser.
          </p>

          <AnalyticsCheckboxLoader />
        </section>
      )}

      {showAlgolia && <Algolia />}
    </main>
  );
}
