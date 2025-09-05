import { requireAuthenticationPage } from "@/auth/server";
import { NotesTableTile } from "@/citizen/components/NotesTableTile";
import { Layout } from "@/common/components/layouts/sidebar/Layout";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import {
  searchParamsNextjsToURLSearchParams,
  type NextjsSearchParams,
} from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { Navigation } from "@/spynet/components/Navigation/Navigation";
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
    <Layout
      title="Spynet"
      sidebar={<Navigation />}
      childrenContainerClassName="overflow-x-hidden"
    >
      <SuspenseWithErrorBoundaryTile>
        <NotesTableTile searchParams={urlSearchParams} />
      </SuspenseWithErrorBoundaryTile>
    </Layout>
  );
}
