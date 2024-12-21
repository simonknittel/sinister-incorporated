import { prisma } from "@/db";
import { type Manufacturer } from "@prisma/client";
import { unstable_cache } from "next/cache";

export const getSeriesByManufacturerIdCached = (
  manufacturerId: Manufacturer["id"],
) => {
  return unstable_cache(
    (manufacturerId: Manufacturer["id"]) =>
      prisma.series.findMany({
        select: {
          id: true,
          name: true,
          variants: {
            select: {
              name: true,
            },
            orderBy: {
              name: "asc",
            },
          },
        },
        where: {
          manufacturerId,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ["series"],
    {
      tags: [`manufacturer:${manufacturerId}`],
    },
  )(manufacturerId);
};
