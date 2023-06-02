import { groupBy } from "lodash";
import { prisma } from "~/server/db";
import FleetTable from "./FleetTable";

const Tile = async () => {
  const orgShips = await prisma.ship.findMany({
    include: {
      variant: {
        include: {
          series: {
            include: {
              manufacturer: true,
            },
          },
        },
      },
    },
  });

  const groupedOrgShips = groupBy(orgShips, (ship) => ship.variant.id);
  const countedOrgShips = Object.values(groupedOrgShips).map((ships) => {
    const ship = ships[0]!;

    return {
      ...ship,
      count: ships.length,
    };
  });

  return (
    <section className="rounded bg-neutral-900 p-4 lg:p-8 mt-4 overflow-auto">
      <FleetTable ships={countedOrgShips} />
    </section>
  );
};

export default Tile;
