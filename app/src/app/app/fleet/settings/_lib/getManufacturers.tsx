import { prisma } from "@/db";
import { unstable_cache } from "next/cache";

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
