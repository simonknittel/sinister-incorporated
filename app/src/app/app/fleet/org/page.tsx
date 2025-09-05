import { requireAuthenticationPage } from "@/auth/server";
import { SidebarLayout } from "@/common/components/layouts/sidebar/Layout";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import {
  searchParamsNextjsToURLSearchParams,
  type NextjsSearchParams,
} from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { Navigation } from "@/fleet/components/Navigation/Navigation";
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
    <SidebarLayout title="Flotte" sidebar={<Navigation />}>
      <SuspenseWithErrorBoundaryTile>
        <OrgFleetTile urlSearchParams={urlSearchParams} />
      </SuspenseWithErrorBoundaryTile>
    </SidebarLayout>
  );
}
