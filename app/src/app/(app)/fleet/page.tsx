import { groupBy } from "lodash";
import { type Metadata } from "next";
import { prisma } from "~/server/db";
import OrgShipTile from "./_components/OrgShipTile";

export const metadata: Metadata = {
  title: "Flotte | Sinister Incorporated",
};

export default async function Page() {
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
    const ship = ships[0];

    return {
      ...ship,
      count: ships.length,
    };
  });

  return (
    <main>
      <h2 className="font-bold text-xl">Alle Schiffe der Org</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-4">
        {countedOrgShips.map((ship) => (
          <OrgShipTile
            key={ship.variantId}
            variant={ship.variant!}
            count={ship.count}
          />
        ))}
      </div>
    </main>
  );
}
