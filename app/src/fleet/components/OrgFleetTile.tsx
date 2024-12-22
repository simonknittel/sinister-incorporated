import { prisma } from "@/db";
import { VariantStatus } from "@prisma/client";
import { groupBy } from "lodash";
import { Filters } from "./Filters";
import { FleetTable } from "./FleetTable";

type Props = Readonly<{
  className?: string;
  urlSearchParams: URLSearchParams;
}>;

export const OrgFleetTile = async ({ className, urlSearchParams }: Props) => {
  const orgShips = await prisma.ship.findMany({
    where: {
      variant: {
        status:
          urlSearchParams.get("flight_ready") === "true"
            ? VariantStatus.FLIGHT_READY
            : undefined,
      },
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
    <section className={className}>
      <h2 className="font-bold">Sinister Incorporated</h2>

      <div className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8 mt-4 overflow-x-auto">
        <Filters />

        <FleetTable ships={countedOrgShips} className="mt-8" />
      </div>
    </section>
  );
};
