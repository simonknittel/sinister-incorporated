import clsx from "clsx";
import { type Metadata } from "next";
import { authenticatePage } from "~/_lib/auth/authenticateAndAuthorize";
import { Hero } from "~/app/_components/Hero";
import { getUnleashFlag } from "~/app/_lib/getUnleashFlag";
import { CalendarTile } from "./_components/CalendarTile";
import { ProfileTile } from "./_components/ProfileTile";
import { QuotesTile } from "./_components/QuotesTile";
import { SpynetSearchTile } from "./_components/SpynetSearchTile";

export const metadata: Metadata = {
  title: "Dashboard | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();

  const showEventsTile = authentication.authorize([
    {
      resource: "event",
      operation: "read",
    },
  ]);

  const showSpynetSearchTile = !(await getUnleashFlag("DisableAlgolia"));

  return (
    <main className="p-2 lg:p-8 pt-20">
      <div className="flex justify-center">
        <Hero text="Sinister Inc" />
      </div>

      <div
        className={clsx("mt-8", {
          "flex gap-8 flex-col xl:flex-row": showEventsTile,
        })}
      >
        {showEventsTile && <CalendarTile className="xl:w-2/3" />}

        <div className="flex flex-col gap-4 xl:w-1/3">
          {showSpynetSearchTile && <SpynetSearchTile />}
          <ProfileTile />
        </div>
      </div>

      <QuotesTile className="mt-4" />
    </main>
  );
}
