import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import clsx from "clsx";
import { getMyFleet } from "../queries";
import { AssignShip } from "./AssignShip";
import { MyShipTile } from "./MyShipTile";

type Props = Readonly<{
  className?: string;
}>;

export const MyFleetTile = async ({ className }: Props) => {
  const authentication = await requireAuthentication();
  if (!(await authentication.authorize("ship", "manage")))
    throw new Error("Forbidden");

  const [myShips, allVariants] = await Promise.all([
    getMyFleet(),

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
    <section className={clsx("flex flex-col gap-4 overflow-hidden", className)}>
      <div>
        <h2 className="font-thin text-2xl">Meine Schiffe ({myShips.length})</h2>
        <p className="hidden xl:block text-neutral-500 text-sm">&nbsp;</p>
      </div>

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
