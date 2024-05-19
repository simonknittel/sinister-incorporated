import { type Manufacturer, type Series } from "@prisma/client";
import { cache } from "react";
import { prisma } from "../../../../../server/db";

export const dedupedGetSeriesAndManufacturerById = cache(
  async (seriesId: Series["id"], manufacturerId: Manufacturer["id"]) => {
    return Promise.all([
      prisma.series.findUnique({
        where: {
          id: seriesId,
        },
      }),

      prisma.manufacturer.findUnique({
        where: {
          id: manufacturerId,
        },
      }),
    ]);
  },
);
