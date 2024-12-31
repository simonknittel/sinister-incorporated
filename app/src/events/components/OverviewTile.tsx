import { DiscordButton } from "@/common/components/DiscordButton";
import { TimeAgoLoader } from "@/common/components/TimeAgoLoader";
import { type getEvent } from "@/discord/getEvent";
import clsx from "clsx";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import { DownloadEventButton } from "./DownloadEventButton";

type Props = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
  date: Awaited<ReturnType<typeof getEvent>>["date"];
}>;

export const OverviewTile = ({ className, event, date }: Props) => {
  return (
    <section
      className={clsx(className)}
      style={{
        gridArea: "overview",
      }}
    >
      <div className="rounded-2xl bg-neutral-800/50 overflow-auto">
        {event.image && (
          <Image
            src={`https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.webp?size=1024`}
            alt=""
            // Discord recommends 800x320px
            width={800}
            height={320}
            className="flex-initial w-full"
            priority
          />
        )}

        <div className="p-4 lg:p-8">
          <h2 className="font-bold">{event.name}</h2>

          {event.description && (
            <div className="mt-4 prose prose-invert">
              <MDXRemote source={event.description} />
            </div>
          )}

          <dl className="mt-4">
            <dt className="text-neutral-500">Start</dt>
            <dd>
              {event.scheduled_start_time.toLocaleDateString("de-DE", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "Europe/Berlin",
              })}{" "}
              -{" "}
              {event.scheduled_start_time.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Berlin",
              })}
            </dd>

            <dt className="text-neutral-500 mt-4">Ende</dt>
            <dd>
              {event.scheduled_end_time.toLocaleDateString("de-DE", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "Europe/Berlin",
              })}{" "}
              -{" "}
              {event.scheduled_end_time.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Berlin",
              })}
            </dd>
          </dl>

          <div className="flex flex-col gap-2 mt-4">
            <DownloadEventButton event={event} />

            <DiscordButton path={`events/${event.guild_id}/${event.id}`} />
          </div>
        </div>
      </div>

      {date && (
        <p className="text-neutral-500 mt-4 flex items-center gap-2 pl-4 lg:pl-8">
          Letzte Aktualisierung:
          <TimeAgoLoader date={date} />
        </p>
      )}
    </section>
  );
};
