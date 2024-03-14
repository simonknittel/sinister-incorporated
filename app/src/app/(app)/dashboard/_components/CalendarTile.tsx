import clsx from "clsx";
import dynamic from "next/dynamic";
import { getEvents } from "~/_lib/discord/getEvents";
import { Hero } from "~/app/_components/Hero";
import { Event } from "./Event";

const TimeAgoContainer = dynamic(
  () => import("../../_components/TimeAgoContainer"),
  {
    ssr: false,
    loading: () => (
      <span className="block h-[1em] w-[7em] animate-pulse rounded bg-neutral-500" />
    ),
  },
);

type Props = Readonly<{
  className?: string;
}>;

export const CalendarTile = async ({ className }: Props) => {
  const { date, data: events } = await getEvents();

  return (
    <section
      className={clsx(
        className,
        "flex flex-col gap-4 items-center 3xl:overflow-hidden",
      )}
    >
      <Hero text="Kalender" size="md" />

      {events
        .sort(
          (a, b) =>
            a.scheduled_start_time.getTime() - b.scheduled_start_time.getTime(),
        )
        .map((event) => (
          <Event key={event.id} event={event} />
        ))}

      {events.length === 0 && (
        <div className="bg-neutral-800/50 rounded-2xl p-4 lg:p-8 w-full">
          <p>Aktuell sind keine Events geplant.</p>
        </div>
      )}

      {date && (
        <p className="text-neutral-500 flex items-center gap-2 w-full">
          Letzte Aktualisierung:
          <TimeAgoContainer date={date} />
        </p>
      )}
    </section>
  );
};
