import { type Metadata } from "next";
import Link from "next/link";
import { authenticateAndAuthorizePage } from "~/app/_utils/authenticateAndAuthorize";

export const metadata: Metadata = {
  title: "Spynet | Sinister Incorporated",
};

export default async function Page() {
  await authenticateAndAuthorizePage("view-spynet");

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

        <h1>Dashboard</h1>
      </div>
    </main>
  );
}
