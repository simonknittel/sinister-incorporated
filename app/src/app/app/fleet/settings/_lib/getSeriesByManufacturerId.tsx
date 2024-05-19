import { type Manufacturer } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "../../../../../server/db";

export const cachedGetSeriesByManufacturerId = (
  manufacturerId: Manufacturer["id"],
) => {
  return unstable_cache(
    (manufacturerId: Manufacturer["id"]) =>
      prisma.series.findMany({
        select: {
          id: true,
          name: true,
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
