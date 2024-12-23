import { authenticatePage } from "@/auth/server";
import Tab from "@/common/components/tabs/Tab";
import TabList from "@/common/components/tabs/TabList";
import TabPanel from "@/common/components/tabs/TabPanel";
import { TabsProvider } from "@/common/components/tabs/TabsContext";
import type { NextjsSearchParams } from "@/common/utils/searchParamsNextjsToURLSearchParams";
import searchParamsNextjsToURLSearchParams from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { getEvent } from "@/discord/getEvent";
import { FleetTile } from "@/events/components/FleetTile";
import { OverviewTile } from "@/events/components/OverviewTile";
import { ParticipantsTile } from "@/events/components/ParticipantsTile";
import { log } from "@/logging";
import { type Metadata } from "next";
import { FaUsers } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { serializeError } from "serialize-error";

interface Params {
  id: string;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  try {
    const { data: event } = await getEvent(params.id);

    return {
      title: `${event.name} - Event | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
      "Error while generating metadata for /(app)/events/[id]/fleet/page.tsx",
      {
        error: serializeError(error),
      },
    );

    return {
      title: `Error | S.A.M. - Sinister Incorporated`,
    };
  }
}

type Props = Readonly<{
  params: Params;
  searchParams: NextjsSearchParams;
}>;

export default async function Page({ params, searchParams }: Props) {
  const authentication = await authenticatePage("/app/events/[id]");
  authentication.authorizePage("event", "read");
  const showFleetTile = authentication.authorize("orgFleet", "read");

  const { date, data: event } = await getEvent(params.id);

  const urlSearchParams = searchParamsNextjsToURLSearchParams(searchParams);

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl mb-4">
        <span className="text-neutral-500">Event /</span>
        <h1>{event.name}</h1>
      </div>

      <div className="flex gap-8 flex-col-reverse 2xl:flex-row 2xl:items-start">
        <div className="2xl:flex-1">
          <TabsProvider initialActiveTab="participants">
            <TabList>
              <Tab id="participants">
                <FaUsers />
                Teilnehmer ({event.user_count})
              </Tab>

              {showFleetTile && (
                <Tab id="fleet">
                  <MdWorkspaces />
                  Flotte
                </Tab>
              )}
            </TabList>

            <TabPanel id="participants">
              <ParticipantsTile event={event} />
            </TabPanel>

            {showFleetTile && (
              <TabPanel id="fleet">
                <FleetTile event={event} urlSearchParams={urlSearchParams} />
              </TabPanel>
            )}
          </TabsProvider>
        </div>

        <OverviewTile
          event={event}
          date={date}
          className="w-[480px] self-center 2xl:self-start 2xl:flex-none"
        />
      </div>
    </main>
  );
}
