import { requireAuthenticationPage } from "@/auth/server";
import { Link } from "@/common/components/Link";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import {
  searchParamsNextjsToURLSearchParams,
  type NextjsSearchParams,
} from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { type Metadata } from "next";
import OtherTableTile from "../../../../citizen/components/OtherTableTile";

export const revalidate = 0; // TODO: Revert to 60

export const metadata: Metadata = {
  title: "Sonstige - Spynet | S.A.M. - Sinister Incorporated",
};

interface Props {
  readonly searchParams: NextjsSearchParams;
}

export default async function Page({ searchParams }: Props) {
  const authentication = await requireAuthenticationPage("/app/spynet/other");
  await Promise.all([
    authentication.authorizePage("citizen", "read"),
    authentication.authorizePage("spynetOther", "read"),
  ]);

  const urlSearchParams =
    await searchParamsNextjsToURLSearchParams(searchParams);

  return (
    <main className="p-4 pb-20 lg:p-6 flex flex-col gap-4">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/app/spynet"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
        >
          Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <h1>Sonstige</h1>
      </div>

      <SuspenseWithErrorBoundaryTile>
        <OtherTableTile searchParams={urlSearchParams} />
      </SuspenseWithErrorBoundaryTile>
    </main>
  );
}
