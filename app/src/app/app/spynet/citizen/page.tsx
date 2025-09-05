import { requireAuthenticationPage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import {
  searchParamsNextjsToURLSearchParams,
  type NextjsSearchParams,
} from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { Template } from "@/spynet/components/Template";
import { type Metadata } from "next";
import { CitizenTableTile } from "../../../../citizen/components/CitizenTableTile";

export const revalidate = 0; // TODO: Revert to 60

export const metadata: Metadata = {
  title: "Citizen - Spynet | S.A.M. - Sinister Incorporated",
};

interface Props {
  readonly searchParams: NextjsSearchParams;
}

export default async function Page({ searchParams }: Props) {
  const authentication = await requireAuthenticationPage("/app/spynet/citizen");
  await Promise.all([
    authentication.authorizePage("citizen", "read"),
    authentication.authorizePage("spynetCitizen", "read"),
  ]);

  const urlSearchParams =
    await searchParamsNextjsToURLSearchParams(searchParams);

  return (
    <Template mainClassName="overflow-x-hidden">
      <SuspenseWithErrorBoundaryTile>
        <CitizenTableTile searchParams={urlSearchParams} />
      </SuspenseWithErrorBoundaryTile>
    </Template>
  );
}
