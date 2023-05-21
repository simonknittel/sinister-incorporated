import { type Metadata } from "next";
import Link from "next/link";
import {
  authenticateAndAuthorize,
  authenticateAndAuthorizePage,
} from "~/app/_utils/authenticateAndAuthorize";
import AnalyticsCheckbox from "./_components/AnalyticsCheckbox";

export const metadata: Metadata = {
  title: "Einstellungen | Sinister Incorporated",
};

export default async function Page() {
  await authenticateAndAuthorizePage([
    "edit-classification-levels",
    "disable-analytics",
  ]);

  return (
    <main className="p-4 lg:p-8 pt-20">
      <h1 className="text-xl font-bold">Einstellungen</h1>

      {(await authenticateAndAuthorize("edit-classification-levels")) && (
        <section className="mt-4 max-w-4xl p-4 lg:p-8 rounded bg-neutral-900">
          <h2 className="font-bold text-xl">Sicherheitsstufen</h2>

          <p className="mt-4 mb-4">
            Jeder Notiz, jedem Event und jeder Operation kann eine
            Sicherheitsstufe zugewiesen werden. Anhand dieser können{" "}
            <Link href="/roles" className="underline hover:text-neutral-300">
              Berechtigungen
            </Link>{" "}
            vergeben werden.
          </p>
        </section>
      )}

      {(await authenticateAndAuthorize("disable-analytics")) && (
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
