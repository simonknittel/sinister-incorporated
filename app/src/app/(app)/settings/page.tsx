import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { env } from "~/env.mjs";
import { authOptions } from "~/server/auth";
import AnalyticsCheckbox from "./_components/AnalyticsCheckbox";

export const metadata: Metadata = {
  title: "Settings | Sinister Incorporated",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (["admin"].includes(session!.user.role) === false) redirect("/events");

  return (
    <main className="p-4 lg:p-8 pt-20">
      <h1 className="text-xl font-bold">Settings</h1>

      <section className="mt-4 max-w-4xl p-4 lg:p-8 rounded bg-neutral-900">
        <h2 className="font-bold text-xl">Disable analytics</h2>

        <p className="mt-4 mb-4">Disables Vercel Analytics for this browser.</p>

        <AnalyticsCheckbox />
      </section>

      <section className="mt-4 max-w-4xl p-4 lg:p-8 rounded bg-neutral-900">
        <h2 className="font-bold text-xl">Configured server</h2>

        <pre className="mt-4">{env.DISCORD_GUILD_ID}</pre>
      </section>
    </main>
  );
}
