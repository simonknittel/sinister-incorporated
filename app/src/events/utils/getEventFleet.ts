import { prisma } from "@/db";
import type { getEvent } from "@/discord/getEvent";
import { getEventUsersDeduped } from "@/discord/getEventUsers";
import { VariantStatus } from "@prisma/client";
import { groupBy } from "lodash";
import { cache } from "react";

export const getEventFleet = cache(
  async (
    event: Awaited<ReturnType<typeof getEvent>>["data"],
    onlyFlightReady = false,
  ) => {
    const users = await getEventUsersDeduped(event.id);
    const userIds = users.map((user) => user.user.id);

    const ships = await prisma.ship.findMany({
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
          status: onlyFlightReady ? VariantStatus.FLIGHT_READY : undefined,
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

    const groupedShips = groupBy(ships, (ship) => ship.variant.id);

    const countedShips = Object.values(groupedShips).map((ships) => {
      const ship = ships[0];

      return {
        variant: ship.variant,
        count: ships.length,
      };
    });

    return countedShips;
  },
);