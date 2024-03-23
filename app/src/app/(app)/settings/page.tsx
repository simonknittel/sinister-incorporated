import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { authenticatePage } from "~/_lib/auth/authenticateAndAuthorize";
import { log } from "~/_lib/logging";
import ClassificationLevelsTile from "./_components/classification-level/ClassificationLevelsTile";
import NoteTypesTile from "./_components/note-type/NoteTypesTile";

const AnalyticsCheckbox = dynamic(
  () => import("./_components/AnalyticsCheckbox"),
  { ssr: false },
);

export const metadata: Metadata = {
  title: "Einstellungen | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();

  const showNoteTypes = authentication.authorize([
    {
      resource: "noteType",
      operation: "manage",
    },
  ]);

  const showClassificationLevels = authentication.authorize([
    {
      resource: "classificationLevel",
      operation: "manage",
    },
  ]);

  const showAnalytics = authentication.authorize([
    {
      resource: "analytics",
      operation: "manage",
    },
  ]);

  if (!showNoteTypes && !showClassificationLevels && !showAnalytics) {
    log.info("Unauthorized request to page", {
      userId: authentication.session.user.id,
      reason: "Insufficient permissions",
    });

    redirect("/");
  }

  return (
    <main className="p-2 lg:p-8 pt-20">
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
