import { type Metadata } from "next";
import { Suspense } from "react";
import { authenticatePage } from "../../lib/auth/server";
import { getUnleashFlag } from "../../lib/getUnleashFlag";
import { Hero } from "../_components/Hero";
import { SpynetSearchTile } from "../_components/SpynetSearchTile/SpynetSearchTile";
import { CalendarTile } from "./_components/CalendarTile";
import { ProfileTile } from "./_components/ProfileTile";
import { QuotesTile } from "./_components/QuotesTile";
import { TileSkeleton } from "./_components/TileSkeleton";

export const metadata: Metadata = {
  title: "Dashboard | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app");

  const showCalendar = authentication.authorize("event", "read");

  const showSpynetSearchTile = !(await getUnleashFlag("DisableAlgolia"));

  return (
    <main className="p-2 lg:p-8 pt-20 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Sinister Inc" />
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
