import { requireAuthenticationPage } from "@/auth/server";
import { NotesTableTile } from "@/citizen/components/NotesTableTile";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import {
  searchParamsNextjsToURLSearchParams,
  type NextjsSearchParams,
} from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { Template } from "@/spynet/components/Template";
import { type Metadata } from "next";

export const revalidate = 0; // TODO: Revert to 60

export const metadata: Metadata = {
  title: "Notizen - Spynet | S.A.M. - Sinister Incorporated",
};

interface Props {
  readonly searchParams: NextjsSearchParams;
}

export default async function Page({ searchParams }: Props) {
  const authentication = await requireAuthenticationPage("/app/spynet/notes");
  await Promise.all([
    authentication.authorizePage("citizen", "read"),
    authentication.authorizePage("spynetNotes", "read"),
  ]);

  const urlSearchParams =
    await searchParamsNextjsToURLSearchParams(searchParams);

  return (
    <Template mainClassName="overflow-x-hidden">
      <SuspenseWithErrorBoundaryTile>
        <NotesTableTile searchParams={urlSearchParams} />
      </SuspenseWithErrorBoundaryTile>
    </Template>
  );
}
