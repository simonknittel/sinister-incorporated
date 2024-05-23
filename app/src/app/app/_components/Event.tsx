import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { requireAuthentication } from "../../../lib/auth/server";
import { DiscordButton } from "../../_components/DiscordButton";
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
  index: number;
}>;

export const Event = async ({ className, event, index }: Props) => {
  const authentication = await requireAuthentication();

  const isToday =
    event.scheduled_start_time.toISOString().split("T")[0] ===
    new Date().toISOString().split("T")[0];

  /**
   * Image size:
   * Discord recommends 800x320px.
   * Our maximum height should be 160px. Therefore, we calculate the width based on the aspect ratio.
   * 800 / 320 * 160 = 400
   */

  return (
    <article className={clsx(className, "rounded-2xl overflow-hidden w-full")}>
      {isToday && (
        <div className="bg-sinister-red-500/50 text-white font-bold text-center p-2">
          <TimeAgoContainer date={event.scheduled_start_time} />
        </div>
      )}

      <div className="flex flex-col 3xl:flex-row bg-neutral-800/50">
        {event.image && (
          <div className="3xl:flex-grow-0 3xl:flex-shrink-0 3xl:basis-[400px] max-h-[160px] flex justify-center rounded-r-2xl rounded-b-2xl overflow-hidden">
            <Image
              src={`https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.webp?size=1024`}
              alt=""
              width={400}
              height={160}
              priority={index < 3}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col gap-2 p-4 lg:p-8 3xl:overflow-hidden">
          <h2 className="font-bold text-xl 3xl:text-ellipsis 3xl:whitespace-nowrap 3xl:overflow-hidden">
            {event.name}
          </h2>

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

        <div className="flex-initial flex 3xl:flex-col gap-2 p-4 pt-0 lg:pl-8 lg:pr-8 lg:pb-8 3xl:pt-8">
          <DiscordButton
            path={`events/${event.guild_id}/${event.id}`}
            className="flex-1"
          />

          {authentication.authorize("eventFleet", "read") && (
            <Link
              href={`/app/events/${event.id}`}
              className="flex-1 flex items-center justify-center gap-4 rounded uppercase h-11 border text-base border-sinister-red-500 text-sinister-red-500 hover:border-sinister-red-300 active:border-sinister-red-300 hover:text-sinister-red-300 active:text-sinister-red-300 px-6 whitespace-nowrap"
            >
              Details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
