import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";
import { requireAuthentication } from "~/_lib/auth/authenticateAndAuthorize";
import TimeAgoContainer from "../../_components/TimeAgoContainer";

type Props = Readonly<{
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
}>;

export const Event = async ({ className, event }: Props) => {
  const authentication = await requireAuthentication();

  const isToday =
    event.scheduled_start_time.toDateString().split("T")[0] ===
    new Date().toDateString().split("T")[0];

  // Discord recommends 800x320px
  const originalWidth = 800;
  const originalHeight = 320;
  const targetHeight = 160;
  const targetWidth = (originalWidth / originalHeight) * targetHeight;

  return (
    <article
      className={clsx(className, "backdrop-blur rounded-2xl overflow-hidden")}
    >
      {isToday && (
        <div className="bg-sinister-red-500/50 text-white font-bold text-center p-2">
          <TimeAgoContainer date={event.scheduled_start_time} />
        </div>
      )}

      <div className="flex flex-col lg:flex-row bg-neutral-800/50">
        {event.image && (
          <Image
            src={`https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.webp?size=1024`}
            alt=""
            width={targetWidth}
            height={targetHeight}
            className="flex-initial"
          />
        )}

        <div className="flex-1 flex flex-col gap-2 p-4 lg:p-8">
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
            <span className="text-neutral-500">Teilnehmeranzahl:</span>{" "}
            {event.user_count}
          </p>
        </div>

        <div className="flex-initial flex flex-col gap-2 p-4 pt-0 lg:p-8">
          <Link
            href={`https://discord.com/events/${event.guild_id}/${event.id}`}
            className="flex items-center justify-center gap-4 rounded uppercase h-11 border text-base border-neutral-500 text-neutral-500 hover:border-neutral-300 active:border-neutral-300 hover:text-neutral-300 active:text-neutral-300 px-6"
            prefetch={false}
          >
            Discord <FaDiscord />
          </Link>

          {authentication.authorize([
            {
              resource: "eventFleet",
              operation: "read",
            },
          ]) && (
            <Link
              href={`/events/${event.id}`}
              className="flex items-center justify-center gap-4 rounded uppercase h-11 border text-base border-sinister-red-500 text-sinister-red-500 hover:border-sinister-red-300 active:border-sinister-red-300 hover:text-sinister-red-300 active:text-sinister-red-300 px-6 whitespace-nowrap"
              prefetch={false}
            >
              Details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
