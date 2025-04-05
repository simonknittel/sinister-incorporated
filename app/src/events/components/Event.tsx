import { requireAuthentication } from "@/auth/server";
import { Badge } from "@/common/components/Badge";
import { DiscordNavigationButton } from "@/common/components/DiscordNavigationButton";
import { Link } from "@/common/components/Link";
import TimeAgoContainer from "@/common/components/TimeAgoContainer";
import { formatDate } from "@/common/utils/formatDate";
import type {
  Entity,
  EventDiscordParticipant,
  Event as PrismaEvent,
} from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import { FaCheck, FaClock, FaUser } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { isLineupVisible } from "../utils/isLineupVisible";

/**
 * Image size:
 * Discord recommends 800x320px.
 * Our maximum height should be 160px. Therefore, we calculate the width based
 * on the aspect ratio.
 * 800 / 320 * 160 = 400
 */

type Props = Readonly<{
  className?: string;
  event: PrismaEvent & {
    discordParticipants: EventDiscordParticipant[];
    managers: Entity[];
  };
  index: number;
}>;

export const Event = async ({ className, event, index }: Props) => {
  const authentication = await requireAuthentication();

  const now = new Date();
  const endTime = new Date(event.startTime);
  endTime.setHours(endTime.getHours() + 4);
  const isHappeningNow =
    event.startTime <= now && (event.endTime || endTime) >= now;
  const isToday =
    event.startTime.toISOString().split("T")[0] ===
    now.toISOString().split("T")[0];

  const formattedStartTime = formatDate(event.startTime, "long");

  const isCurrentCitizenParticipating = event.discordParticipants.some(
    (participant) =>
      participant.discordUserId === authentication.session.discordId,
  );

  const showLineupButton = await isLineupVisible(event);

  return (
    <article className={clsx("rounded-2xl overflow-hidden w-full", className)}>
      {isHappeningNow && (
        <div className="bg-green-500/50 text-white font-bold text-center p-2">
          Event läuft
        </div>
      )}

      {isToday && !isHappeningNow && (
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
            <Badge
              label="Startzeit"
              value={formattedStartTime!}
              icon={<FaClock />}
            />

            <Badge
              label="Teilnehmer"
              value={event.discordParticipants.length.toString()}
              icon={<FaUser />}
            />

            {isCurrentCitizenParticipating && (
              <Badge
                label="Eigene Teilnahme"
                value="Zugesagt"
                icon={<FaCheck />}
                className="text-green-500"
              />
            )}
          </div>

          <div className="flex flex-wrap">
            <Link
              href={`/app/events/${event.id}`}
              className="first:rounded-l border-[1px] border-sinister-red-700 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300"
            >
              Details
            </Link>

            {showLineupButton && (
              <Link
                href={`/app/events/${event.id}/lineup`}
                className="first:rounded-l border-[1px] border-sinister-red-700 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300"
              >
                <MdWorkspaces />
                Aufstellung
              </Link>
            )}

            <DiscordNavigationButton
              path={`events/${event.discordGuildId}/${event.discordId}`}
            />
          </div>
        </div>
      </div>
    </article>
  );
};
