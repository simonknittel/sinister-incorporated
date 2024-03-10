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
    <section className="rounded-2xl bg-neutral-800/50 backdrop-blur p-4 lg:p-8 mt-4 overflow-auto">
      <FleetTable ships={countedOrgShips} />
    </section>
  );
};

export default Tile;
