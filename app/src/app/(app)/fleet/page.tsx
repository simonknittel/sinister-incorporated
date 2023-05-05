import { groupBy } from "lodash";
import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import AssignShip from "./_components/AssignShip";
import ShipTile from "./_components/ShipTile";

export const metadata: Metadata = {
  title: "Flotte | Sinister Incorporated",
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  const [orgOwnerships, allShips] = await prisma.$transaction([
    prisma.fleetOwnership.findMany({
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
    }),

    prisma.manufacturer.findMany({
      include: {
        series: {
          include: {
            variants: true,
          },
        },
      },
    }),
  ]);

  const myOwnerships = orgOwnerships.filter(
    (ownership) => ownership.userId === session!.user.id
  );

  const groupedOwnerships = groupBy(
    orgOwnerships,
    (ownership) => ownership.variant.id
  );
  const orgShips = Object.values(groupedOwnerships).map((ownerships) => {
    const ownership = ownerships[0];

    return {
      ...ownership,
      count: ownerships.reduce((acc, curr) => acc + curr.count, 0),
    };
  });

  return (
    <main>
      <section>
        <h2 className="font-bold text-xl">Meine Schiffe</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-4">
          {myOwnerships.map((ownership) => (
            <ShipTile
              key={`${ownership.userId}_${ownership.variantId}`}
              ownership={ownership}
            />
          ))}

          <AssignShip data={allShips} />
        </div>
      </section>

      <section>
        <h2 className="font-bold text-xl mt-8">Alle Schiffe der Org</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-4">
          {orgShips.map((ownership) => (
            <ShipTile
              key={ownership.variantId}
              ownership={ownership}
              nonInteractive={true}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
