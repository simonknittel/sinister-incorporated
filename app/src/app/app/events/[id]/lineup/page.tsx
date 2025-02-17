import { authenticatePage } from "@/auth/server";
import { prisma } from "@/db";
import { getEvent } from "@/discord/utils/getEvent";
import { LineupTab } from "@/events/components/LineupTab";
import { Navigation } from "@/events/components/Navigation";
import { getEventByDiscordId } from "@/events/queries";
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
    const { data: event } = await getEvent((await props.params).id);

    return {
      title: `Aufstellung - ${event.name} - Event | S.A.M. - Sinister Incorporated`,
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
  const event = await getEvent(eventId);
  const databaseEvent = await getEventByDiscordId(eventId);
  if (!databaseEvent) return null; // TODO: Find better fallback for when event didn't get scraped yet

  const canManagePositions =
    event.data.creator_id === authentication.session.discordId ||
    (await authentication.authorize("othersEventPosition", "manage"));

  const variants = await prisma.manufacturer.findMany({
    include: {
      series: {
        include: {
          variants: true,
        },
      },
    },
  });

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Event /</span>
        <p>{event.data.name}</p>
      </div>

      <Navigation
        eventId={eventId}
        participantsCount={event.data.user_count}
        active={`/app/events/${eventId}/lineup`}
        className="mt-4"
      />

      <LineupTab
        event={databaseEvent}
        canManagePositions={canManagePositions}
        variants={variants}
        className="mt-4"
      />
    </main>
  );
}
