import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { RiSpaceShipFill } from "react-icons/ri";

interface Props {
  className?: string;
  event: {
    id: string;
    name: string;
    image?: string;
    scheduled_start_time: Date;
    scheduled_end_time: Date;
    user_count: number;
  };
}

const Event = ({ className, event }: Props) => {
  return (
    <article className={clsx(className, "block bg-neutral-900 rounded")}>
      <span className="flex gap-4 items-center font-bold">
        <p className="bg-neutral-950 py-2 px-4 rounded-br">
          {event.scheduled_start_time.toLocaleDateString("de-DE", {
            weekday: "short",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          -{" "}
          {event.scheduled_start_time.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <p>{event.name}</p>
      </span>

      {event.image && (
        <Image
          src={`https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.webp?size=1024`}
          alt=""
          width={1024} // Discord recommends 800x320px
          height={410}
        />
      )}

      <span className="flex justify-between items-center p-4">
        <p>{event.user_count} Teilnehmer</p>

        <Link
          href={`/events/${event.id}/fleet`}
          className="flex items-center justify-center gap-4 rounded uppercase h-11 border text-base border-sinister-red-500 text-sinister-red-500 hover:border-sinister-red-300 active:border-sinister-red-300 hover:text-sinister-red-300 active:text-sinister-red-300 px-6"
        >
          Verfügbare Flotte <RiSpaceShipFill />
        </Link>
      </span>
    </article>
  );
};

export default Event;
