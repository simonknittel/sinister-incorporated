import { authenticatePage } from "@/auth/server";
import { log } from "@/logging";
import { type Metadata } from "next";
import { serializeError } from "serialize-error";
import { getEvent } from "../../../../discord/getEvent";
import { FleetTile } from "./_components/FleetTile";
import { OverviewTile } from "./_components/OverviewTile";
import { ParticipantsTile } from "./_components/ParticipantsTile";

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
    await log.error(
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
}>;

export default async function Page({ params }: Props) {
  const authentication = await authenticatePage("/app/events/[id]");
  authentication.authorizePage("event", "read");

  const showFleetTile = authentication.authorize("orgFleet", "read");

  const { date, data: event } = await getEvent(params.id);

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl mb-4">
        <span className="text-neutral-500">Event /</span>
        <h1>{event.name}</h1>
      </div>

      <div className="flex gap-8 flex-col-reverse 2xl:flex-row 2xl:items-start">
        <div className="flex flex-col gap-4 2xl:flex-1">
          <ParticipantsTile event={event} />
          {showFleetTile && <FleetTile event={event} />}
        </div>

        <OverviewTile
          event={event}
          date={date}
          className="max-w-[480px] self-center 2xl:self-start 2xl:flex-none"
        />
      </div>
    </main>
  );
}
