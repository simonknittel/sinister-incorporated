import { prisma } from "@/db";
import { type Manufacturer } from "@prisma/client";

export const getSeriesByManufacturerId = (
  manufacturerId: Manufacturer["id"],
) => {
  return prisma.series.findMany({
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
  });
};
