import { requireAuthenticationPage } from "@/auth/server";
import { SidebarLayout } from "@/common/components/layouts/SidebarLayout";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { EventsTile } from "@/events/components/EventsTile";
import { Filters } from "@/events/components/Filters";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | S.A.M. - Sinister Incorporated",
};

export default async function Page({ searchParams }: PageProps<"/app/events">) {
  const authentication = await requireAuthenticationPage("/app/events");
  await authentication.authorizePage("event", "read");

  return (
    <SidebarLayout
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
