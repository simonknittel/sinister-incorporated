import { authenticatePage } from "@/auth/server";
import Note from "@/common/components/Note";
import { prisma } from "@/db";
import { LineupTab } from "@/events/components/LineupTab";
import { Navigation } from "@/events/components/Navigation";
import { getEventByDiscordId } from "@/events/queries";
import { getEventCitizen } from "@/events/utils/getEventCitizen";
import { getMyFleet } from "@/fleet/queries";
import { log } from "@/logging";
import { type Metadata } from "next";
import { serializeError } from "serialize-error";

type Params = Promise<{
  id: string;
}>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  try {
    const eventId = (await props.params).id;
    const event = await getEventByDiscordId(eventId);

    return {
      title: `Aufstellung - ${event?.discordName} - Event | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
      "Error while generating metadata for /app/events/[id]/fleet/page.tsx",
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
  await authentication.authorizePage("event", "read");

  const eventId = (await params).id;
  const databaseEvent = await getEventByDiscordId(eventId);
  if (!databaseEvent)
    return (
      <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
        <div className="flex gap-2 font-bold text-xl">
          <span className="text-neutral-500">Event /</span>
          <p>???</p>
        </div>

        <Navigation
          eventId={eventId}
          active={`/app/events/${eventId}/lineup`}
          className="mt-4"
        />

        <Note
          type="info"
          className="mt-4"
          message="Es dauert etwa drei Minuten nach Eventerstellung bis die Aufstellung verfügbar ist."
        />
      </main>
    );

  const canManagePositions =
    databaseEvent.discordCreatorId === authentication.session.discordId ||
    (await authentication.authorize("othersEventPosition", "manage"));

  const [variants, myShips, allEventCitizen] = await Promise.all([
    prisma.manufacturer.findMany({
      include: {
        series: {
          include: {
            variants: true,
          },
        },
      },
    }),

    getMyFleet(),

    getEventCitizen(databaseEvent.id),
  ]);

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Event /</span>
        <p>{databaseEvent.discordName}</p>
      </div>

      <Navigation
        eventId={eventId}
        participantsCount={databaseEvent.participants.length}
        active={`/app/events/${eventId}/lineup`}
        className="mt-4"
      />

      <LineupTab
        event={databaseEvent}
        canManagePositions={canManagePositions}
        variants={variants}
        myShips={myShips}
        allEventCitizen={allEventCitizen}
        className="mt-4"
      />
    </main>
  );
}
