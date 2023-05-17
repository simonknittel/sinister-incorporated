import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authorize } from "~/app/_utils/authorize";
import { authOptions } from "~/server/auth";

export const metadata: Metadata = {
  title: "Einstellungen - Spynet | Sinister Incorporated",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!authorize("spynet-settings", session)) redirect("/dashboard");

  return (
    <main className="p-4 lg:p-8 pt-20">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/spynet"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
        >
          Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <h1>Einstellungen</h1>
      </div>

      <section className="mt-4 max-w-4xl p-4 lg:p-8 rounded bg-neutral-900">
        <h2 className="font-bold text-xl">Sicherheitsstufen</h2>
      </section>
    </main>
  );
}
