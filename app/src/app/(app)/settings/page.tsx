import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { authenticatePage } from "~/_lib/auth/authenticateAndAuthorize";
import ClassificationLevelsTile from "./_components/classification-level/ClassificationLevelsTile";

const AnalyticsCheckbox = dynamic(
  () => import("./_components/AnalyticsCheckbox"),
  { ssr: false },
);

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
        <section className="mt-4 max-w-4xl p-4 lg:p-8 rounded-2xl bg-neutral-800/50 backdrop-blur">
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
