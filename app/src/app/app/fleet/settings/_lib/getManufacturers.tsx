import { unstable_cache } from "next/cache";
import { prisma } from "../../../../../server/db";

export const cachedGetManufacturers = () => {
  return unstable_cache(
    () =>
      prisma.manufacturer.findMany({
        select: {
          id: true,
          imageId: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ["manufacturer"],
    {
      tags: ["manufacturer"],
    },
  )();
};
