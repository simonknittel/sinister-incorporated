import { TimeAgoLoader } from "@/common/components/TimeAgoLoader";
import { getEvents } from "@/discord/getEvents";
import clsx from "clsx";
import { Event } from "./Event";

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
      <h2 className="font-bold text-xl self-start">Kalender</h2>

      {events
        .toSorted(
          (a, b) =>
            a.scheduled_start_time.getTime() - b.scheduled_start_time.getTime(),
        )
        .map((event, index) => (
          <Event key={event.id} event={event} index={index} />
        ))}

      {events.length === 0 && (
        <div className="bg-neutral-800/50 rounded-2xl p-4 lg:p-8 w-full">
          <p>Aktuell sind keine Events geplant.</p>
        </div>
      )}

      {date && (
        <p className="text-neutral-500 flex items-center gap-2 w-full">
          Letzte Aktualisierung:
          <TimeAgoLoader date={date} />
        </p>
      )}
    </section>
  );
};
