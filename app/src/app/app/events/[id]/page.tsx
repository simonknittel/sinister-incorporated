import { authenticatePage } from "@/auth/server";
import { getEvent } from "@/discord/utils/getEvent";
import { Navigation } from "@/events/components/Navigation";
import { OverviewTab } from "@/events/components/OverviewTab";
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
      title: `${event.name} - Event | S.A.M. - Sinister Incorporated`,
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

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Event /</span>
        <p>{event.data.name}</p>
      </div>

      <Navigation
        eventId={eventId}
        participantsCount={event.data.user_count}
        active={`/app/events/${eventId}`}
        className="mt-4"
      />

      <OverviewTab event={event} className="mt-4" />
    </main>
  );
}
