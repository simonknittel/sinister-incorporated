import { type Metadata } from "next";
import Link from "next/link";
import { authenticatePage } from "~/app/_lib/auth/authenticateAndAuthorize";
import NoteTypesTile from "./_components/note-type/NoteTypesTile";

export const metadata: Metadata = {
  title: "Einstellungen - Spynet | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();
  authentication.authorizePage([
    {
      resource: "noteType",
      operation: "manage",
    },
  ]);

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

      <NoteTypesTile className="mt-4" />
    </main>
  );
}
