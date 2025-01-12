import { authenticatePage } from "@/auth/server";
import { getEvent } from "@/discord/utils/getEvent";
import { Navigation } from "@/events/components/Navigation";
import { ParticipantsTab } from "@/events/components/ParticipantsTab";
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
      title: `Teilnehmer - ${event.name} - Event | S.A.M. - Sinister Incorporated`,
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

  const event = await getEvent((await params).id);

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Event /</span>
        <p>{event.data.name}</p>
      </div>

      <Navigation
        eventId={event.data.id}
        participantsCount={event.data.user_count}
        active="/participants"
        className="mt-4"
      />

      <ParticipantsTab event={event.data} className="mt-4" />
    </main>
  );
}
