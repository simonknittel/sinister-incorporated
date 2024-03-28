import { type Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { authenticatePage } from "../../../../lib/auth/authenticateAndAuthorize";
import nextjsSearchParamsToNativeSearchParams from "../../../../lib/nextjsSearchParamsToNativeSearchParams";
import Tile from "./_components/Tile";
import TileSkeleton from "./_components/TileSkeleton";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Notizen - Spynet | Sinister Incorporated",
};

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({
  searchParams: _searchParams,
}: Readonly<Props>) {
  const authentication = await authenticatePage("/app/spynet/notes");
  authentication.authorizePage([
    {
      resource: "citizen",
      operation: "read",
    },
  ]);

  const searchParams = nextjsSearchParamsToNativeSearchParams(_searchParams);

  return (
    <main className="p-2 lg:p-8 pt-20">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/app/spynet/search"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
          prefetch={false}
        >
          Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <h1>Notizen</h1>
      </div>

      <Suspense fallback={<TileSkeleton />}>
        <Tile searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
