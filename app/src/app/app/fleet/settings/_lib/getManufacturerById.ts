import { type Manufacturer } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "../../../../../server/db";

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
