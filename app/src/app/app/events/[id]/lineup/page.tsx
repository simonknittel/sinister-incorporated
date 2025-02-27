import { authenticatePage } from "@/auth/server";
import { prisma } from "@/db";
import { LineupTab } from "@/events/components/LineupTab";
import { Navigation } from "@/events/components/Navigation";
import { getEventById } from "@/events/queries";
import { canEditEvent } from "@/events/utils/canEditEvent";
import { getEventCitizens } from "@/events/utils/getEventCitizens";
import { getMyFleet } from "@/fleet/queries";
import { log } from "@/logging";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { serializeError } from "serialize-error";

type Params = Promise<{
  id: string;
}>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  try {
    const event = await getEventById((await props.params).id);
    if (!event) notFound();

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
  const event = await getEventById(eventId);
  if (!event) notFound();

  const showActions = canEditEvent(event);

  const canManagePositions =
    (event.discordCreatorId === authentication.session.discordId ||
      (await authentication.authorize("othersEventPosition", "manage"))) &&
    showActions;

  // if (!event.lineupEnabled && !canManagePositions) forbidden();

  const [variants, myShips, allEventCitizens] = await Promise.all([
    prisma.manufacturer.findMany({
      include: {
        image: true,
        series: {
          include: {
            variants: true,
          },
        },
      },
    }),

    getMyFleet(),

    getEventCitizens(event.id),
  ]);

  const showToggle = allEventCitizens.some(
    (citizen) => citizen.citizen.id === authentication.session.entityId,
  );

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Event /</span>
        <p>{event.name}</p>
      </div>

      <Navigation
        event={event}
        active={`/app/events/${eventId}/lineup`}
        className="mt-4"
      />

      <LineupTab
        event={event}
        canManagePositions={canManagePositions}
        variants={variants}
        myShips={myShips}
        allEventCitizens={allEventCitizens}
        className="mt-4"
        showActions={showActions}
        showToggle={showToggle}
      />
    </main>
  );
}
