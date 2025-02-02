import { groupBy } from "lodash";
import { getOrgFleet } from "../queries";
import { Filters } from "./Filters";
import { FleetTable } from "./FleetTable";

type Props = Readonly<{
  className?: string;
  urlSearchParams: URLSearchParams;
}>;

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

  return (
    <section className={className}>
      <h2 className="font-bold">Sinister Incorporated</h2>

      <div className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8 mt-4 overflow-x-auto">
        <Filters />

        <FleetTable fleet={countedFleet} className="mt-8" />
      </div>
    </section>
  );
};
