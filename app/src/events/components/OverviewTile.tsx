import { DiscordButton } from "@/common/components/DiscordButton";
import { type getEvent } from "@/discord/getEvent";
import clsx from "clsx";
import dynamic from "next/dynamic";
import Image from "next/image";

const TimeAgoContainer = dynamic(
  () => import("@/common/components/TimeAgoContainer"),
  {
    ssr: false,
    loading: () => (
      <span className="block h-[1em] w-[7em] animate-pulse rounded bg-neutral-500" />
    ),
  },
);

type Props = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
  date: Awaited<ReturnType<typeof getEvent>>["date"];
}>;

export const OverviewTile = ({ className, event, date }: Props) => {
  const descriptionParts = event.description?.split("\n") || [];

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

          {descriptionParts.length > 0 &&
            descriptionParts.map((part, index) => (
              <p key={index} className="mt-2">
                {part}
              </p>
            ))}

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

          <DiscordButton
            path={`events/${event.guild_id}/${event.id}`}
            className="mt-4"
          />
        </div>
      </div>

      {date && (
        <p className="text-neutral-500 mt-4 flex items-center gap-2 pl-4 lg:pl-8">
          Letzte Aktualisierung:
          <TimeAgoContainer date={date} />
        </p>
      )}
    </section>
  );
};
