import { type getEvent } from "@/discord/getEvent";
import { Filters } from "@/fleet/components/Filters";
import { FleetTable } from "@/fleet/components/FleetTable";
import clsx from "clsx";
import { getEventFleet } from "../utils/getEventFleet";

type Props = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
  urlSearchParams: URLSearchParams;
}>;

export const FleetTab = async ({
  className,
  event,
  urlSearchParams,
}: Props) => {
  const eventFleet = await getEventFleet(
    event,
    urlSearchParams.get("flight_ready") === "true",
  );

  return (
    <section
      className={clsx(
        className,
        "rounded-2xl bg-neutral-800/50 p-4 lg:p-8 overflow-auto",
      )}
      style={{
        gridArea: "fleet",
      }}
    >
      <h2 className="sr-only">Flotte</h2>

      {eventFleet.length > 0 ? (
        <>
          <Filters />
          <FleetTable fleet={eventFleet} className="mt-8" />
        </>
      ) : (
        <p>Keine Teilnehmer oder Teilnehmer ohne Schiffe.</p>
      )}
    </section>
  );
};
