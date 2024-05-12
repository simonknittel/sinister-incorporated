import { type Manufacturer } from "@prisma/client";
import { cache } from "react";
import { prisma } from "../../../../../../server/db";

export const getManufacturer = cache(
  async (manufacturerId: Manufacturer["id"]) => {
    return prisma.manufacturer.findUnique({
      where: {
        id: manufacturerId,
      },
    });
  },
);
