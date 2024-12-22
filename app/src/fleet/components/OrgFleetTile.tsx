import { prisma } from "@/db";
import { groupBy } from "lodash";
import FleetTable from "./FleetTable";

type Props = Readonly<{
  className?: string;
}>;

export const OrgFleetTile = async ({ className }: Props) => {
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
    <section className={className}>
      <h2 className="font-bold">Sinister Incorporated</h2>

      <div className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8 mt-4 overflow-x-auto">
        <FleetTable ships={countedOrgShips} />
      </div>
    </section>
  );
};
