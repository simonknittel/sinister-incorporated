import { type getEvent } from "@/discord/getEvent";
import { FleetTable } from "@/fleet/components/FleetTable";
import clsx from "clsx";
import { getEventFleet } from "../utils/getEventFleet";

type Props = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
}>;

export const FleetTab = async ({ className, event }: Props) => {
  const eventFleet = await getEventFleet(event);

  return (
    <section
      className={clsx(
        "rounded-2xl bg-neutral-800/50 p-4 lg:p-8 overflow-auto",
        className,
      )}
      style={{
        gridArea: "fleet",
      }}
    >
      <h2 className="sr-only">Flotte</h2>

      {eventFleet.length > 0 ? (
        <FleetTable fleet={eventFleet} />
      ) : (
        <p>Keine Teilnehmer oder Teilnehmer ohne flight ready Schiffe.</p>
      )}
    </section>
  );
};
