import clsx from "clsx";
import { createLoader, parseAsString, type SearchParams } from "nuqs/server";
import { getEvents } from "../queries";
import { Event } from "./Event";

const loadSearchParams = createLoader({
  status: parseAsString.withDefault("open"),
});

interface Props {
  readonly className?: string;
  readonly searchParams: Promise<SearchParams>;
}

export const EventsTile = async ({ className, searchParams }: Props) => {
  const { status } = await loadSearchParams(searchParams);

  const events = await getEvents(status);

  if (events.length <= 0)
    return (
      <section className={clsx(className)}>
        <div className="rounded-primary bg-neutral-800/50 p-4 flex flex-col items-center gap-4">
          <p>Keine Events gefunden</p>
        </div>
      </section>
    );

  return (
    <section className={clsx("flex flex-col gap-[1px]", className)}>
      {events.map((event, index) => (
        <Event key={event.id} event={event} index={index} />
      ))}
    </section>
  );
};
