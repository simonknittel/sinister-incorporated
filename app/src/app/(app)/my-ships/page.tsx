import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authorize } from "~/app/_utils/authorize";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import AssignShip from "./_components/AssignShip";
import MyShipTile from "./_components/MyShipTile";

export const metadata: Metadata = {
  title: "Meine Schiffe | Sinister Incorporated",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!authorize("add-ship", session)) redirect("/dashboard");

  const [myShips, allVariants] = await prisma.$transaction([
    prisma.ship.findMany({
      where: {
        ownerId: session!.user.id,
      },
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

  return (
    <main className="p-4 lg:p-8 pt-20">
      <h2 className="font-bold text-xl">Meine Schiffe</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-4">
        {myShips.map((ship) => (
          <MyShipTile key={ship.id} ship={ship} />
        ))}

        <AssignShip data={allVariants} />
      </div>
    </main>
  );
}
