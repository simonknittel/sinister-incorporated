import { type Metadata } from "next";
import { Suspense } from "react";
import { authenticatePage } from "~/app/_lib/auth/authenticateAndAuthorize";
import Tile from "./_components/Tile";
import TileSkeleton from "./_components/TileSkeleton";

export const metadata: Metadata = {
  title: "Übersicht - Flotte | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();
  authentication.authorizePage([
    {
      resource: "orgFleet",
      operation: "read",
    },
  ]);

  return (
    <main className="p-2 lg:p-8 pt-20">
      <h2 className="font-bold text-xl">Alle Schiffe der Org</h2>

      <Suspense fallback={<TileSkeleton />}>
        <Tile />
      </Suspense>
    </main>
  );
}
