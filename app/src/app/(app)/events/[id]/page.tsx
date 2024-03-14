import { type Metadata } from "next";
import { serializeError } from "serialize-error";
import { authenticatePage } from "~/_lib/auth/authenticateAndAuthorize";
import { getEvent } from "~/_lib/discord/getEvent";
import { log } from "~/_lib/logging";
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
      title: `Verfügbare Flotte - ${event.name} | Sinister Incorporated`,
    };
  } catch (error) {
    log.error(
      "Error while generating metadata for /(app)/events/[id]/fleet/page.tsx",
      {
        error: serializeError(error),
      },
    );

    return {
      title: `Error | Sinister Incorporated`,
    };
  }
}

type Props = Readonly<{
  params: Params;
}>;

export default async function Page({ params }: Props) {
  const authentication = await authenticatePage();
  authentication.authorizePage([
    {
      resource: "event",
      operation: "read",
    },
  ]);

  const showFleetTile = authentication.authorize([
    {
      resource: "orgFleet",
      operation: "read",
    },
  ]);

  const { date, data: event } = await getEvent(params.id);

  return (
    <main className="p-2 lg:p-8 pt-20 max-w-[1920px] mx-auto">
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
          className="2xl:w-[480px] 2xl:flex-none"
        />
      </div>
    </main>
  );
}
