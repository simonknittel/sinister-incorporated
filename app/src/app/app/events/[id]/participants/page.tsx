import { authenticatePage } from "@/auth/server";
import { getEvent } from "@/discord/getEvent";
import { ParticipantsTab } from "@/events/components/ParticipantsTab";
import { log } from "@/logging";
import { type Metadata } from "next";
import Link from "next/link";
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
      title: `Teilnehmer - ${event.name} - Event | S.A.M. - Sinister Incorporated`,
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
}>;

export default async function Page({ params }: Props) {
  const authentication = await authenticatePage("/app/events/[id]");
  await authentication.authorizePage("event", "read");
  const showFleetTile = await authentication.authorize("orgFleet", "read");

  const event = await getEvent((await params).id);

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Event /</span>
        <p>{event.data.name}</p>
      </div>

      <div className="flex flex-wrap mt-4">
        <Link
          href={`/app/events/${event.data.id}`}
          className="first:rounded-l border-[1px] border-sinister-red-500 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300"
        >
          <FaHome />
          Übersicht
        </Link>

        <Link
          href={`/app/events/${event.data.id}/participants`}
          className="first:rounded-l border-[1px] border-sinister-red-500 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase bg-sinister-red-500 text-white"
        >
          <FaUsers />
          Teilnehmer ({event.data.user_count})
        </Link>

        {showFleetTile && (
          <Link
            href={`/app/events/${event.data.id}/fleet`}
            className="first:rounded-l border-[1px] border-sinister-red-500 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300"
          >
            <MdWorkspaces />
            Flotte
          </Link>
        )}
      </div>

      <ParticipantsTab event={event.data} className="mt-4" />
    </main>
  );
}
