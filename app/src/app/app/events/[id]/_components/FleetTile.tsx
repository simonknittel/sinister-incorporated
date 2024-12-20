import { prisma } from "@/db";
import clsx from "clsx";
import { groupBy } from "lodash";
import { MdWorkspaces } from "react-icons/md";
import { type getEvent } from "../../../../../discord/getEvent";
import { getEventUsers } from "../../../../../discord/getEventUsers";
import FleetTable from "../../../fleet/_components/FleetTable";

type Props = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
}>;

export const FleetTile = async ({ className, event }: Props) => {
  const users = await getEventUsers(event.id);

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
    const ship = ships[0]!;

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
      <h2 className="font-bold mb-4 flex gap-2 items-center">
        <MdWorkspaces /> Flotte
      </h2>

      {countedOrgShips.length > 0 ? (
        <FleetTable ships={countedOrgShips} />
      ) : (
        <p>Keine Teilnehmer oder Teilnehmer ohne Schiffe.</p>
      )}
    </section>
  );
};
