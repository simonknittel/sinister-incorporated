import { prisma } from "@/db";
import { type getEvent } from "@/discord/getEvent";
import { getEventUsersDeduped } from "@/discord/getEventUsers";
import { Filters } from "@/fleet/components/Filters";
import { FleetTable } from "@/fleet/components/FleetTable";
import { VariantStatus } from "@prisma/client";
import clsx from "clsx";
import { groupBy } from "lodash";

type Props = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
  urlSearchParams: URLSearchParams;
}>;

export const FleetTile = async ({
  className,
  event,
  urlSearchParams,
}: Props) => {
  const users = await getEventUsersDeduped(event.id);
  const userIds = users.map((user) => user.user.id);

  const orgShips = await prisma.ship.findMany({
    where: {
      owner: {
        accounts: {
          some: {
            providerAccountId: {
              in: userIds,
            },
          },
        },
      },
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
          tags: true,
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
    <section
      className={clsx(
        className,
        "rounded-2xl bg-neutral-800/50 p-4 lg:p-8 overflow-auto",
      )}
      style={{
        gridArea: "fleet",
      }}
    >
      <h2 className="sr-only">Flotte</h2>

      {countedOrgShips.length > 0 ? (
        <>
          <Filters />
          <FleetTable ships={countedOrgShips} className="mt-8" />
        </>
      ) : (
        <p>Keine Teilnehmer oder Teilnehmer ohne Schiffe.</p>
      )}
    </section>
  );
};
