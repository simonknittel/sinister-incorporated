import { prisma } from "@/db";

export const getManufacturers = () => {
  return prisma.manufacturer.findMany({
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
  });
};
