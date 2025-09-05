import { groupBy } from "lodash";
import { getOrgFleet } from "../queries";
import { Filters } from "./Filters";
import { FleetTable } from "./FleetTable";

interface Props {
  readonly className?: string;
  readonly urlSearchParams: URLSearchParams;
}

export const OrgFleetTile = async ({ className, urlSearchParams }: Props) => {
  const fleet = await getOrgFleet({
    onlyFlightReady: urlSearchParams.get("flight_ready") === "true",
  });

  const groupedFleet = groupBy(fleet, (ship) => ship.variant.id);
  const countedFleet = Object.values(groupedFleet).map((ships) => {
    const ship = ships[0];

    return {
      ...ship,
      count: ships.length,
    };
  });

  const groupedByUser = Object.groupBy(fleet, (ship) => ship.ownerId);

  return (
    <section className={className}>
      <p className="text-neutral-500 text-sm mb-1">
        Schiffe von {Object.keys(groupedByUser).length} Citizen
      </p>

      <div className="rounded-primary bg-neutral-800/50 p-4 overflow-x-auto">
        <Filters />

        <FleetTable fleet={countedFleet} className="mt-6" />
      </div>
    </section>
  );
};
