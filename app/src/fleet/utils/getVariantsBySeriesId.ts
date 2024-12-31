import { prisma } from "@/db";
import type { Series } from "@prisma/client";

export const getVariantsBySeriesId = (seriesId: Series["id"]) => {
  return prisma.variant.findMany({
    where: {
      seriesId,
    },
    include: {
      _count: {
        select: {
          ships: true,
        },
      },
      tags: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};
