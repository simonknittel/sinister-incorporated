import { prisma } from "@/db";
import { type Manufacturer } from "@prisma/client";
import { unstable_cache } from "next/cache";

export const cachedGetManufacturerById = (
  manufacturerId: Manufacturer["id"],
) => {
  return unstable_cache(
    (manufacturerId: Manufacturer["id"]) =>
      prisma.manufacturer.findUnique({
        where: {
          id: manufacturerId,
        },
      }),
    ["manufacturer"],
    {
      tags: [`manufacturer:${manufacturerId}`],
    },
  )(manufacturerId);
};
