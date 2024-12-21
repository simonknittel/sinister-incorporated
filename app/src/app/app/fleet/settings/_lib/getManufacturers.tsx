import { prisma } from "@/db";
import { unstable_cache } from "next/cache";

export const getManufacturersCached = () => {
  return unstable_cache(
    () =>
      prisma.manufacturer.findMany({
        select: {
          id: true,
          imageId: true,
          name: true,
          series: {
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              name: "asc",
            },
          },
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
