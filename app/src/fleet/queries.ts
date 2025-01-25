import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { trace } from "@opentelemetry/api";
import { VariantStatus, type Manufacturer, type Series } from "@prisma/client";
import { cache } from "react";

export const getOrgFleet = async ({
  onlyFlightReady = false,
}: {
  onlyFlightReady?: boolean;
}) => {
  return await trace
    .getTracer("sam")
    .startActiveSpan("getOrgFleet", async (span) => {
      try {
        const authentication = await requireAuthentication();
        if (!(await authentication.authorize("orgFleet", "read")))
          throw new Error("Forbidden");

        return prisma.ship.findMany({
          where: {
            variant: {
              status: onlyFlightReady ? VariantStatus.FLIGHT_READY : undefined,
            },
          },
          include: {
            variant: {
              include: {
                series: {
                  include: {
                    manufacturer: true,
                  },
                },
                tags: true,
              },
            },
          },
        });
      } finally {
        span.end();
      }
    });
};

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

export const getManufacturerById = (manufacturerId: Manufacturer["id"]) => {
  return prisma.manufacturer.findUnique({
    where: {
      id: manufacturerId,
    },
  });
};
