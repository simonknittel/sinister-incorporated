import { prisma } from "@/db";
import type { getEvent } from "@/discord/utils/getEvent";
import { getEventUsers } from "@/discord/utils/getEventUsers";
import { VariantStatus } from "@prisma/client";
import { groupBy } from "lodash";
import { cache } from "react";

export const getEventFleet = cache(
  async (event: Awaited<ReturnType<typeof getEvent>>["data"]) => {
    const users = await getEventUsers(event.id);
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
          status: VariantStatus.FLIGHT_READY,
        },
      },
      include: {
        variant: {
          include: {
            series: {
              include: {
                manufacturer: {
                  include: {
                    image: true,
                  },
                },
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
