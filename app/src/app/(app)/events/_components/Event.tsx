import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";

interface Props {
  className?: string;
  event: {
    id: string;
    guild_id: string;
    name: string;
    image?: string | null;
    scheduled_start_time: Date;
    scheduled_end_time: Date;
    user_count: number;
  };
}

const Event = async ({ className, event }: Props) => {
  const authentication = await authenticate();

  return (
    <article
      className={clsx(
        className,
        "block bg-neutral-900 rounded overflow-hidden"
      )}
    >
      {event.image && (
        <Image
          src={`https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.webp?size=1024`}
          alt=""
          width={1024} // Discord recommends 800x320px
          height={410}
        />
      )}

      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 p-4 lg:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-xl">{event.name}</h2>

          <p>
            <span className="text-neutral-500">Start:</span>{" "}
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

          <p>
            <span className="text-neutral-500">Teilnehmer:</span>{" "}
            {event.user_count}
          </p>
        </div>

        <div className="flex flex-col justify-end gap-2">
          <Link
            href={`https://discord.com/events/${event.guild_id}/${event.id}`}
            className="flex items-center justify-center gap-4 rounded uppercase h-11 border text-base border-neutral-500 text-neutral-500 hover:border-neutral-300 active:border-neutral-300 hover:text-neutral-300 active:text-neutral-300 px-6"
          >
            Discord <FaDiscord />
          </Link>

          {authentication &&
            authentication.authorize([
              {
                resource: "eventFleet",
                operation: "read",
              },
            ]) && (
              <Link
                href={`/events/${event.id}/fleet`}
                className="flex items-center justify-center gap-4 rounded uppercase h-11 border text-base border-sinister-red-500 text-sinister-red-500 hover:border-sinister-red-300 active:border-sinister-red-300 hover:text-sinister-red-300 active:text-sinister-red-300 px-6"
              >
                Verfügbare Flotte <MdWorkspaces />
              </Link>
            )}
        </div>
      </div>
    </article>
  );
};

export default Event;
