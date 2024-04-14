import { type Metadata } from "next";
import { Suspense } from "react";
import { authenticatePage } from "../../../lib/auth/server";
import Tile from "./_components/Tile";
import TileSkeleton from "./_components/TileSkeleton";

export const metadata: Metadata = {
  title: "Benutzer | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/users");
  authentication.authorizePage("user", "read");

  return (
    <main className="p-2 lg:p-8 pt-20">
      <h1 className="text-xl font-bold">Benutzer</h1>

      <Suspense fallback={<TileSkeleton />}>
        <Tile />
      </Suspense>
    </main>
  );
}
