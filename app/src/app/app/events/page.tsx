import { requireAuthenticationPage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { EventsTile } from "@/events/components/EventsTile";
import { Filters } from "@/events/components/Filters";
import { NotificationsTooltip } from "@/events/components/NotificationsTooltip";
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
    <div className="p-4 pb-20 lg:pb-4">
      <div className="flex justify-center items-center gap-2 mb-4">
        <Hero text="Events" withGlitch size="md" /> <NotificationsTooltip />
      </div>

      <div className="flex flex-col md:flex-row gap-4 @container">
        <Filters className="md:w-64 md:flex-none" />

        <main className="@7xl:flex-1 max-w-[400px] @7xl:max-w-none">
          <SuspenseWithErrorBoundaryTile>
            <EventsTile searchParams={searchParams} />
          </SuspenseWithErrorBoundaryTile>
        </main>
      </div>
    </div>
  );
}
