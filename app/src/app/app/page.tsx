import { requireAuthenticationPage } from "@/auth/server";
import { ProfileTile } from "@/citizen/components/ProfileTile";
import { Hero } from "@/common/components/Hero";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { UwuHero } from "@/common/components/UwuHero";
import { getUnleashFlag } from "@/common/utils/getUnleashFlag";
import {
  searchParamsNextjsToURLSearchParams,
  type NextjsSearchParams,
} from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { TileSkeleton } from "@/dashboard/components/TileSkeleton";
import { CalendarTile } from "@/events/components/CalendarTile";
import { SpynetSearchTile } from "@/spynet/components/SpynetSearchTile/SpynetSearchTile";
import { TasksDashboardTile } from "@/tasks/components/DashboardTile";
import { type Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard | S.A.M. - Sinister Incorporated",
};

interface Props {
  readonly searchParams: NextjsSearchParams;
}

export default async function Page({ searchParams }: Props) {
  const authentication = await requireAuthenticationPage("/app");

  const showCalendar = await authentication.authorize("event", "read");
  const showSpynetSearchTile =
    !(await getUnleashFlag("DisableAlgolia")) &&
    ((await authentication.authorize("citizen", "read")) ||
      (await authentication.authorize("organization", "read")));

  const urlSearchParams =
    await searchParamsNextjsToURLSearchParams(searchParams);
  const showUwuHero = urlSearchParams.has("uwu");

  return (
    <main className="p-4 pb-20 lg:p-6 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        {showUwuHero ? <UwuHero /> : <Hero text="S.A.M." withGlitch />}
      </div>

      <div className="mt-6 flex gap-6 flex-row flex-wrap justify-center mx-auto @container">
        {showCalendar && (
          <Suspense
            fallback={
              <TileSkeleton className="flex-none @7xl:flex-1 max-w-[400px] @7xl:max-w-none" />
            }
          >
            <CalendarTile className="flex-none @7xl:flex-1 max-w-[400px] @7xl:max-w-none" />
          </Suspense>
        )}

        <div className="flex flex-col gap-6 max-w-[400px] flex-none">
          <TasksDashboardTile />

          <section className="flex flex-col gap-[2px] flex-none">
            <h2 className="font-thin text-2xl self-start mb-2">Spynet</h2>

            {showSpynetSearchTile && <SpynetSearchTile />}

            <SuspenseWithErrorBoundaryTile>
              <ProfileTile />
            </SuspenseWithErrorBoundaryTile>
          </section>
        </div>
      </div>
    </main>
  );
}
