import { authenticatePage } from "@/auth/server";
import { ProfileTile } from "@/citizen/components/ProfileTile";
import { Hero } from "@/common/components/Hero";
import { UwuHero } from "@/common/components/UwuHero";
import { dedupedGetUnleashFlag } from "@/common/utils/getUnleashFlag";
import {
  searchParamsNextjsToURLSearchParams,
  type NextjsSearchParams,
} from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { QuotesTile } from "@/dashboard/components/QuotesTile";
import { TileSkeleton } from "@/dashboard/components/TileSkeleton";
import { CalendarTile } from "@/discord/components/CalendarTile";
import { SpynetSearchTile } from "@/spynet/components/SpynetSearchTile/SpynetSearchTile";
import { type Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard | S.A.M. - Sinister Incorporated",
};

type Props = Readonly<{
  searchParams: NextjsSearchParams;
}>;

export default async function Page({ searchParams }: Props) {
  const authentication = await authenticatePage("/app");

  const showCalendar = await authentication.authorize("event", "read");
  const showSpynetSearchTile =
    !(await dedupedGetUnleashFlag("DisableAlgolia")) &&
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

        <section className="flex flex-col gap-4 xl:w-[400px] flex-none">
          <h2 className="font-bold text-xl self-start">Spynet</h2>
          {showSpynetSearchTile && <SpynetSearchTile />}
          <ProfileTile />
        </section>
      </div>

      <QuotesTile className="mt-4" />
    </main>
  );
}
