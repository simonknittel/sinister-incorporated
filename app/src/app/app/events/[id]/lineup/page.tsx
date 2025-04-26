import { authenticatePage } from "@/auth/server";
import { prisma } from "@/db";
import { LineupTab } from "@/events/components/LineupTab";
import { Template } from "@/events/components/Template";
import { getEventById } from "@/events/queries";
import { getEventCitizens } from "@/events/utils/getEventCitizens";
import { isAllowedToManagePositions } from "@/events/utils/isAllowedToManagePositions";
import { isEventUpdatable } from "@/events/utils/isEventUpdatable";
import { isLineupVisible } from "@/events/utils/isLineupVisible";
import { getMyFleet } from "@/fleet/queries";
import { log } from "@/logging";
import { type Metadata } from "next";
import { forbidden, notFound } from "next/navigation";
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

interface Props {
  readonly params: Params;
}

export default async function Page({ params }: Props) {
  const authentication = await authenticatePage("/app/events/[id]");
  if (!authentication.session.entity) forbidden();
  await authentication.authorizePage("event", "read");

  const eventId = (await params).id;
  const event = await getEventById(eventId);
  if (!event) notFound();

  const showActions = isEventUpdatable(event);
  const showManagePositions =
    (await isAllowedToManagePositions(event)) && showActions;

  if (!(await isLineupVisible(event))) forbidden();

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
    (citizen) => citizen.citizen.id === authentication.session.entity!.id,
  );

  return (
    <Template event={event}>
      <LineupTab
        event={event}
        canManagePositions={showManagePositions}
        variants={variants}
        myShips={myShips}
        allEventCitizens={allEventCitizens}
        showActions={showActions}
        showToggle={showToggle}
      />
    </Template>
  );
}
