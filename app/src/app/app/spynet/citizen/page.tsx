import { authenticatePage } from "@/auth/server";
import { Link } from "@/common/components/Link";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import {
  searchParamsNextjsToURLSearchParams,
  type NextjsSearchParams,
} from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { type Metadata } from "next";
import { Suspense } from "react";
import { CitizenTableTile } from "../../../../citizen/components/CitizenTableTile";

export const revalidate = 0; // TODO: Revert to 60

export const metadata: Metadata = {
  title: "Citizen - Spynet | S.A.M. - Sinister Incorporated",
};

interface Props {
  readonly searchParams: NextjsSearchParams;
}

export default async function Page({ searchParams }: Props) {
  const authentication = await authenticatePage("/app/spynet/citizen");
  await Promise.all([
    authentication.authorizePage("citizen", "read"),
    authentication.authorizePage("spynetCitizen", "read"),
  ]);

  const urlSearchParams =
    await searchParamsNextjsToURLSearchParams(searchParams);

  return (
    <main className="p-4 pb-20 lg:p-8">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/app/spynet"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
        >
          Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <h1>Citizen</h1>
      </div>

      <Suspense fallback={<SkeletonTile className="mt-4" />}>
        <CitizenTableTile searchParams={urlSearchParams} className="mt-4" />
      </Suspense>
    </main>
  );
}
