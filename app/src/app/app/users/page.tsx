import { authenticatePage } from "@/auth/server";
import { type Metadata } from "next";
import { Suspense } from "react";
import Tile from "./_components/Tile";
import TileSkeleton from "./_components/TileSkeleton";

export const metadata: Metadata = {
  title: "Benutzer | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/users");
  authentication.authorizePage("user", "read");

  return (
    <main className="p-4 pb-20 lg:p-8">
      <h1 className="text-xl font-bold">Benutzer</h1>

      <Suspense fallback={<TileSkeleton />}>
        <Tile />
      </Suspense>
    </main>
  );
}
