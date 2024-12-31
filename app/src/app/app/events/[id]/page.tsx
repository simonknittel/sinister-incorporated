import { authenticatePage } from "@/auth/server";
import Tab from "@/common/components/tabs/Tab";
import TabList from "@/common/components/tabs/TabList";
import TabPanel from "@/common/components/tabs/TabPanel";
import { TabsProvider } from "@/common/components/tabs/TabsContext";
import {
  searchParamsNextjsToURLSearchParams,
  type NextjsSearchParams,
} from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { getEvent } from "@/discord/getEvent";
import { FleetTab } from "@/events/components/FleetTab";
import { OverviewTab } from "@/events/components/OverviewTab";
import { OverviewTile } from "@/events/components/OverviewTile";
import { ParticipantsTab } from "@/events/components/ParticipantsTab";
import { log } from "@/logging";
import { type Metadata } from "next";
import { FaHome, FaUsers } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { serializeError } from "serialize-error";

type Params = Promise<{
  id: string;
}>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  try {
    const { data: event } = await getEvent((await props.params).id);

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
  await authentication.authorizePage("event", "read");
  const showFleetTile = await authentication.authorize("orgFleet", "read");

  const { date, data: event } = await getEvent((await params).id);

  const urlSearchParams =
    await searchParamsNextjsToURLSearchParams(searchParams);

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl mb-4">
        <span className="text-neutral-500">Event /</span>
        <h1>{event.name}</h1>
      </div>

      <div className="flex gap-8 flex-col-reverse 2xl:flex-row 2xl:items-start">
        <div className="2xl:flex-1">
          <TabsProvider initialActiveTab="overview">
            <TabList>
              <Tab id="overview">
                <FaHome />
                Übersicht
              </Tab>

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

            <TabPanel id="overview">
              <OverviewTab event={event} />
            </TabPanel>

            <TabPanel id="participants">
              <ParticipantsTab event={event} />
            </TabPanel>

            {showFleetTile && (
              <TabPanel id="fleet">
                <FleetTab event={event} urlSearchParams={urlSearchParams} />
              </TabPanel>
            )}
          </TabsProvider>
        </div>

        <OverviewTile
          event={event}
          date={date}
          className="w-full max-w-[480px] self-center 2xl:self-start 2xl:flex-none"
        />
      </div>
    </main>
  );
}
