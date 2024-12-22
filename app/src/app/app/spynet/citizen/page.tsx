import { authenticatePage } from "@/auth/server";
import searchParamsNextjsToURLSearchParams from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { type Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Tile } from "./_components/Tile";
import TileSkeleton from "./_components/TileSkeleton";

export const revalidate = 0; // TODO: Revert to 60

export const metadata: Metadata = {
  title: "Citizen - Spynet | S.A.M. - Sinister Incorporated",
};

type Props = Readonly<{
  searchParams: { [key: string]: string | string[] | undefined };
}>;

export default async function Page({ searchParams: _searchParams }: Props) {
  const authentication = await authenticatePage("/app/spynet/citizen");
  authentication.authorizePage("citizen", "read");

  const searchParams = searchParamsNextjsToURLSearchParams(_searchParams);

  return (
    <main className="p-4 pb-20 lg:p-8">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/app/spynet/search"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
        >
          Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <h1>Citizen</h1>
      </div>

      <Suspense fallback={<TileSkeleton />}>
        <Tile searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
