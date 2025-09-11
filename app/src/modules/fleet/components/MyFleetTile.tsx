import { prisma } from "@/db";
import { requireAuthentication } from "@/modules/auth/server";
import clsx from "clsx";
import { forbidden } from "next/navigation";
import { getMyFleet } from "../queries";
import { AssignShip } from "./AssignShip";
import { MyShipTile } from "./MyShipTile";

interface Props {
  readonly className?: string;
}

export const MyFleetTile = async ({ className }: Props) => {
  const authentication = await requireAuthentication();
  if (!(await authentication.authorize("ship", "manage"))) forbidden();

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
    <section className={clsx("flex flex-col gap-[2px]", className)}>
      <p className="text-neutral-500 text-sm mb-1">Anzahl: {myShips.length}</p>

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
