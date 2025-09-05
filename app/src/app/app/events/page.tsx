import { requireAuthenticationPage } from "@/auth/server";
import { SidebarLayout } from "@/common/components/layouts/sidebar/Layout";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { EventsTile } from "@/events/components/EventsTile";
import { Filters } from "@/events/components/Filters";
import { type Metadata } from "next";
import type { SearchParams } from "nuqs";

export const metadata: Metadata = {
  title: "Events | S.A.M. - Sinister Incorporated",
};

interface Props {
  readonly searchParams: Promise<SearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const authentication = await requireAuthenticationPage("/app/events");
  await authentication.authorizePage("event", "read");

  return (
    <SidebarLayout
      title="Events"
      sidebar={<Filters />}
      childrenContainerClassName="@container"
    >
      <div className="@7xl:flex-1 max-w-[400px] @7xl:max-w-none">
        <SuspenseWithErrorBoundaryTile>
          <EventsTile searchParams={searchParams} />
        </SuspenseWithErrorBoundaryTile>
      </div>
    </SidebarLayout>
  );
}
