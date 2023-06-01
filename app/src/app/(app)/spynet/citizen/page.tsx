import { type Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { authenticatePage } from "~/app/_lib/auth/authenticateAndAuthorize";
import Tile from "./_components/Tile";
import TileSkeleton from "./_components/TileSkeleton";

export const metadata: Metadata = {
  title: "Citizen - Spynet | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();
  authentication.authorizePage([
    {
      resource: "citizen",
      operation: "read",
    },
  ]);

  return (
    <main className="p-2 lg:p-8 pt-20">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/spynet/search"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
        >
          Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <h1>Citizen</h1>
      </div>

      <Suspense fallback={<TileSkeleton />}>
        <Tile />
      </Suspense>
    </main>
  );
}
