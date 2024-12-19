import { authenticatePage } from "@/auth/server";
import { log } from "@/logging";
import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import ClassificationLevelsTile from "./_components/classification-level/ClassificationLevelsTile";
import NoteTypesTile from "./_components/note-type/NoteTypesTile";

const AnalyticsCheckbox = dynamic(
  () => import("./_components/AnalyticsCheckbox"),
  { ssr: false },
);

export const metadata: Metadata = {
  title: "Einstellungen | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/settings");

  const showNoteTypes = authentication.authorize("noteType", "manage");

  const showClassificationLevels = authentication.authorize(
    "classificationLevel",
    "manage",
  );

  const showAnalytics = authentication.authorize("analytics", "manage");

  if (!showNoteTypes && !showClassificationLevels && !showAnalytics) {
    await log.info("Unauthorized request to page", {
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
        <section className="mt-4 max-w-4xl p-4 lg:p-8 rounded-2xl bg-neutral-800/50 ">
          <h2 className="font-bold text-xl">Disable analytics</h2>

          <p className="mt-4 mb-4">
            Disables Vercel Analytics for this browser.
          </p>

          <AnalyticsCheckbox />
        </section>
      )}
    </main>
  );
}
