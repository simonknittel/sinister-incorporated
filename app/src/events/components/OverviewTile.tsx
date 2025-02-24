import { DiscordButton } from "@/common/components/DiscordButton";
import type { DiscordEvent } from "@prisma/client";
import clsx from "clsx";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import { DownloadEventButton } from "./DownloadEventButton";

type Props = Readonly<{
  className?: string;
  event: DiscordEvent;
}>;

export const OverviewTile = ({ className, event }: Props) => {
  return (
    <section
      className={clsx("rounded-2xl bg-neutral-800/50 overflow-auto", className)}
      style={{
        gridArea: "overview",
      }}
    >
      {event.discordImage && (
        <Image
          src={`https://cdn.discordapp.com/guild-events/${event.discordId}/${event.discordImage}.webp?size=1024`}
          alt=""
          // Discord recommends 800x320px
          width={800}
          height={320}
          className="flex-initial w-full"
          priority
        />
      )}

      <div className="p-4 lg:p-8">
        <h1 className="font-bold">{event.discordName}</h1>

        {event.description && (
          <div className="mt-4 prose prose-invert">
            {/* TODO: Add noreferrer to links */}
            <MDXRemote source={event.description} />
          </div>
        )}

        <dl className="mt-4">
          <dt className="text-neutral-500">Start</dt>
          <dd>
            {event.startTime!.toLocaleString("de-DE", {
              timeZone: "Europe/Berlin",
              weekday: "short",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </dd>

          <dt className="text-neutral-500 mt-4">Ende</dt>
          <dd>
            {event.endTime?.toLocaleString("de-DE", {
              timeZone: "Europe/Berlin",
              weekday: "short",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) || "-"}
          </dd>

          <dt className="text-neutral-500 mt-4">Ort</dt>
          <dd>{event.location || "-"}</dd>
        </dl>

        <div className="flex flex-col gap-2 mt-4">
          <DownloadEventButton event={event} />

          <DiscordButton
            path={`events/${event.discordGuildId}/${event.discordId}`}
          />
        </div>
      </div>
    </section>
  );
};
