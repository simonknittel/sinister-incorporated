import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { withTrace } from "@/tracing/utils/withTrace";
import { VariantStatus, type Manufacturer, type Series } from "@prisma/client";
import { cache } from "react";

export const getOrgFleet = cache(
  withTrace(
    "getOrgFleet",
    async ({ onlyFlightReady = false }: { onlyFlightReady?: boolean }) => {
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
                  manufacturer: {
                    include: {
                      image: true,
                    },
                  },
                },
              },
              tags: true,
            },
          },
        },
      });
    },
  ),
);

export const getMyFleet = cache(
  withTrace("getMyFleet", async () => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("ship", "read")))
      throw new Error("Forbidden");

    return prisma.ship.findMany({
      where: {
        ownerId: authentication.session.user.id,
      },
      include: {
        variant: {
          include: {
            series: {
              include: {
                manufacturer: {
                  include: {
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }),
);

export const getVariantsBySeriesId = withTrace(
  "getVariantsBySeriesId",
  async (seriesId: Series["id"]) => {
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
  },
);

export const getSeriesByManufacturerId = withTrace(
  "getSeriesByManufacturerId",
  async (manufacturerId: Manufacturer["id"]) => {
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
  },
);

export const getSeriesAndManufacturerById = cache(
  withTrace(
    "getSeriesAndManufacturerById",
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
  ),
);

export const getManufacturers = withTrace("getManufacturers", async () => {
  return prisma.manufacturer.findMany({
    select: {
      id: true,
      imageId: true,
      image: true,
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
});

export const getManufacturerById = withTrace(
  "getManufacturerById",
  async (manufacturerId: Manufacturer["id"]) => {
    return prisma.manufacturer.findUnique({
      where: {
        id: manufacturerId,
      },
      include: {
        image: true,
      },
    });
  },
);
