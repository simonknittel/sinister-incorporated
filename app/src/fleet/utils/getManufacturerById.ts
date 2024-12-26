import { prisma } from "@/db";
import { type Manufacturer } from "@prisma/client";

export const getManufacturerById = (manufacturerId: Manufacturer["id"]) => {
  return prisma.manufacturer.findUnique({
    where: {
      id: manufacturerId,
    },
  });
};
