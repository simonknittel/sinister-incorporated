import clsx from "clsx";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";
import { type getEvent } from "~/_lib/discord/getEvent";

const TimeAgoContainer = dynamic(
  () => import("../../../_components/TimeAgoContainer"),
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
              })}{" "}
              -{" "}
              {event.scheduled_start_time.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>

            <dt className="text-neutral-500 mt-4">Ende</dt>
            <dd>
              {event.scheduled_end_time.toLocaleDateString("de-DE", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              -{" "}
              {event.scheduled_end_time.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>
          </dl>

          <Link
            href={`https://discord.com/events/${event.guild_id}/${event.id}`}
            className="mt-4 inline-flex items-center justify-center gap-4 rounded uppercase h-11 border text-base border-neutral-500 text-neutral-500 hover:border-neutral-300 active:border-neutral-300 hover:text-neutral-300 active:text-neutral-300 px-6"
            prefetch={false}
          >
            Discord <FaDiscord />
          </Link>
        </div>
      </div>

      {date && (
        <p className="text-neutral-500 mt-4 flex items-center gap-2 pl-8">
          Letzte Aktualisierung:
          <TimeAgoContainer date={date} />
        </p>
      )}
    </section>
  );
};
