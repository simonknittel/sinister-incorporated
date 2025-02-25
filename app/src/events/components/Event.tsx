import { DiscordNavigationButton } from "@/common/components/DiscordNavigationButton";
import { Link } from "@/common/components/Link";
import TimeAgoContainer from "@/common/components/TimeAgoContainer";
import type { Event as PrismaEvent } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import { FaClock, FaUser } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";

type Props = Readonly<{
  className?: string;
  event: PrismaEvent & {
    _count: {
      discordParticipants: number;
    };
  };
  index: number;
}>;

export const Event = ({ className, event, index }: Props) => {
  const isToday =
    event.startTime.toISOString().split("T")[0] ===
    new Date().toISOString().split("T")[0];

  const startTime = event.startTime.toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  /**
   * Image size:
   * Discord recommends 800x320px.
   * Our maximum height should be 160px. Therefore, we calculate the width based
   * on the aspect ratio.
   * 800 / 320 * 160 = 400
   */

  return (
    <article className={clsx(className, "rounded-2xl overflow-hidden w-full")}>
      {isToday && (
        <div className="bg-sinister-red-500/50 text-white font-bold text-center p-2">
          <TimeAgoContainer date={event.startTime} />
        </div>
      )}

      <div className="flex flex-col 3xl:flex-row bg-neutral-800/50">
        {event.discordImage && (
          <div className="3xl:flex-grow-0 3xl:flex-shrink-0 3xl:basis-[400px] max-h-[160px] flex justify-center rounded-r-2xl rounded-b-2xl overflow-hidden">
            <Image
              src={`https://cdn.discordapp.com/guild-events/${event.discordId}/${event.discordImage}.webp?size=1024`}
              alt=""
              width={400}
              height={160}
              priority={index < 3}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col gap-3 justify-center p-4 lg:p-6 3xl:overflow-hidden">
          <h2
            className="font-bold text-xl 3xl:text-ellipsis 3xl:whitespace-nowrap 3xl:overflow-hidden"
            title={event.name}
          >
            {event.name}
          </h2>

          <div className="flex flex-wrap gap-2">
            <p
              title={`Startzeit: ${startTime}`}
              className="rounded-full bg-neutral-700/50 px-3 flex gap-2 items-center"
            >
              <FaClock className="text-xs text-neutral-500" />
              {startTime}
            </p>

            <p
              title={`Teilnehmer: ${event._count.discordParticipants}`}
              className="rounded-full bg-neutral-700/50 px-3 flex gap-2 items-center"
            >
              <FaUser className="text-xs text-neutral-500" />
              {event._count.discordParticipants}
            </p>
          </div>

          <div className="flex flex-wrap">
            <Link
              href={`/app/events/${event.id}`}
              className="first:rounded-l border-[1px] border-sinister-red-700 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300"
            >
              Details
            </Link>

            {/* TODO: Implement */}
            {/* {event.lineupEnabled && ( */}
            {true && (
              <Link
                href={`/app/events/${event.id}/lineup`}
                className="first:rounded-l border-[1px] border-sinister-red-700 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300"
              >
                <MdWorkspaces />
                Aufstellung
              </Link>
            )}

            <DiscordNavigationButton
              path={`events/${event.discordGuildId}/${event.id}`}
            />
          </div>
        </div>
      </div>
    </article>
  );
};
