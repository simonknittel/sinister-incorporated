import { Link } from "@/common/components/Link";
import { getFutureEvents } from "@/events/queries";
import clsx from "clsx";
import { Event } from "./Event";
import { NotificationsTooltip } from "./NotificationsTooltip";

interface Props {
  readonly className?: string;
}

export const CalendarTile = async ({ className }: Props) => {
  const events = await getFutureEvents();

  return (
    <section
      className={clsx(
        "flex flex-col gap-4 items-center @7xl:overflow-hidden",
        className,
      )}
    >
      <div className="w-full flex gap-2 items-center">
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
        href="/app/events/history"
        className="text-interaction-500 hover:underline focus-visible:underline"
      >
        Vergangene Events
      </Link>
    </section>
  );
};
