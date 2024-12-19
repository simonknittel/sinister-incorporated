import { authenticate } from "@/auth/server";
import { prisma } from "@/db";
import clsx from "clsx";
import AssignShip from "./AssignShip";
import { MyShipTile } from "./MyShipTile";

type Props = Readonly<{
  className?: string;
}>;

export const MyFleetTile = async ({ className }: Props) => {
  const authentication = await authenticate();

  if (!authentication || !authentication.authorize("ship", "manage"))
    throw new Error("Unauthenticated");

  const [myShips, allVariants] = await prisma.$transaction([
    prisma.ship.findMany({
      where: {
        ownerId: authentication.session.user.id,
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
    <section className={clsx(className, "flex flex-col gap-4")}>
      <h2 className="font-bold">Mein Schiffe</h2>

      {myShips
        .toSorted((a, b) => {
          return (a.name || a.variant.name).localeCompare(
            b.name || b.variant.name,
          );
        })
        .map((ship) => (
          <MyShipTile key={ship.id} ship={ship} className="w-full" />
        ))}

      <AssignShip data={allVariants} />
    </section>
  );
};
