import { authenticatePage } from "@/auth/server";
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
  const authentication = await authenticatePage("/app");

  const showCalendar = await authentication.authorize("event", "read");
  const showSpynetSearchTile =
    !(await getUnleashFlag("DisableAlgolia")) &&
    ((await authentication.authorize("citizen", "read")) ||
      (await authentication.authorize("organization", "read")));

  const urlSearchParams =
    await searchParamsNextjsToURLSearchParams(searchParams);
  const showUwuHero = urlSearchParams.has("uwu");

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        {showUwuHero ? <UwuHero /> : <Hero text="S.A.M." withGlitch />}
      </div>

      <div className="mt-8 flex gap-8 flex-col xl:flex-row justify-center max-w-[400px] mx-auto xl:max-w-none">
        {showCalendar && (
          <Suspense
            fallback={
              <TileSkeleton className="flex-1 xl:max-w-[400px] 3xl:max-w-none" />
            }
          >
            <CalendarTile className="flex-1 xl:max-w-[400px] 3xl:max-w-none" />
          </Suspense>
        )}

        <div className="flex flex-col gap-8">
          <TasksDashboardTile />

          <section className="flex flex-col gap-4 xl:w-[400px] flex-none">
            <h2 className="font-thin text-2xl self-start">Spynet</h2>
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
