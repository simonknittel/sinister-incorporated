import { groupBy } from "lodash";
import { type Metadata } from "next";
import { authenticatePage } from "~/app/_lib/auth/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import FleetTable from "./_components/FleetTable";

export const metadata: Metadata = {
  title: "Flotte | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();
  authentication.authorizePage([
    {
      resource: "orgFleet",
      operation: "read",
    },
  ]);

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
    <main className="p-2 lg:p-8 pt-20">
      <h2 className="font-bold text-xl">Alle Schiffe der Org</h2>

      <div className="rounded bg-neutral-900 p-4 lg:p-8 mt-4 overflow-auto">
        <FleetTable ships={countedOrgShips} />
      </div>
    </main>
  );
}
