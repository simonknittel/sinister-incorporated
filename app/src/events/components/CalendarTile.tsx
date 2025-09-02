import { Link } from "@/common/components/Link";
import { getEvents } from "@/events/queries";
import clsx from "clsx";
import { Event } from "./Event";
import { NotificationsTooltip } from "./NotificationsTooltip";

interface Props {
  readonly className?: string;
}

export const CalendarTile = async ({ className }: Props) => {
  const events = await getEvents("open");

  return (
    <section
      className={clsx(
        "flex flex-col gap-[2px] items-center @7xl:overflow-hidden",
        className,
      )}
    >
      <div className="w-full flex gap-2 items-center mb-2">
        <h2 className="font-thin text-2xl">Discord-Events</h2>
        <NotificationsTooltip />
      </div>

      {events.length > 0 ? (
        events.map((event, index) => (
          <Event key={event.id} event={event} index={index} />
        ))
      ) : (
        <div className="background-secondary rounded-primary p-4 w-full">
          <p>Aktuell sind keine Events geplant.</p>
        </div>
      )}

      <Link
        href="/app/events"
        className="text-interaction-500 hover:underline focus-visible:underline"
      >
        Alle Events
      </Link>
    </section>
  );
};
