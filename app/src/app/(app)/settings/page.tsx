import { type Metadata } from "next";
import { authenticatePage } from "~/app/_lib/auth/authenticateAndAuthorize";
import AnalyticsCheckbox from "./_components/AnalyticsCheckbox";
import ClassificationLevelsTile from "./_components/classification-level/ClassificationLevelsTile";

export const metadata: Metadata = {
  title: "Einstellungen | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();
  authentication.authorizePage([
    {
      resource: "classificationLevel",
      operation: "manage",
    },
    {
      resource: "analytics",
      operation: "manage",
    },
  ]);

  return (
    <main className="p-2 lg:p-8 pt-20">
      <h1 className="text-xl font-bold">Einstellungen</h1>

      {authentication.authorize([
        {
          resource: "classificationLevel",
          operation: "manage",
        },
      ]) && <ClassificationLevelsTile className="mt-4" />}

      {authentication.authorize([
        {
          resource: "analytics",
          operation: "manage",
        },
      ]) && (
        <section className="mt-4 max-w-4xl p-4 lg:p-8 rounded bg-neutral-900">
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
