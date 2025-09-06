import { requireAuthenticationPage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import {
  searchParamsNextjsToURLSearchParams,
  type NextjsSearchParams,
} from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { OrgFleetTile } from "@/fleet/components/OrgFleetTile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Sinister Incorporated - Flotte | S.A.M. - Sinister Incorporated",
};

interface Props {
  readonly searchParams: NextjsSearchParams;
}

export default async function Page({ searchParams }: Props) {
  const authentication = await requireAuthenticationPage("/app/fleet/org");
  await authentication.authorizePage("orgFleet", "read");

  const urlSearchParams =
    await searchParamsNextjsToURLSearchParams(searchParams);

  return (
    <SuspenseWithErrorBoundaryTile>
      <OrgFleetTile urlSearchParams={urlSearchParams} />
    </SuspenseWithErrorBoundaryTile>
  );
}
