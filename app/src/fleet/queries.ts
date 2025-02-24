import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import { VariantStatus, type Manufacturer, type Series } from "@prisma/client";
import { cache } from "react";

export const getOrgFleet = async ({
  onlyFlightReady = false,
}: {
  onlyFlightReady?: boolean;
}) => {
  return getTracer().startActiveSpan("getOrgFleet", async (span) => {
    try {
      const authentication = await requireAuthentication();
      if (!(await authentication.authorize("orgFleet", "read")))
        throw new Error("Forbidden");

      return await prisma.ship.findMany({
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
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
};

export const getMyFleet = async () => {
  return getTracer().startActiveSpan("getMyFleet", async (span) => {
    try {
      const authentication = await requireAuthentication();

      return await prisma.ship.findMany({
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
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
};

export const getVariantsBySeriesId = (seriesId: Series["id"]) => {
  return getTracer().startActiveSpan("getVariantsBySeriesId", async (span) => {
    try {
      return await prisma.variant.findMany({
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
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
};

export const getSeriesByManufacturerId = (
  manufacturerId: Manufacturer["id"],
) => {
  return getTracer().startActiveSpan(
    "getSeriesByManufacturerId",
    async (span) => {
      try {
        return await prisma.series.findMany({
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
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
        });
        throw error;
      } finally {
        span.end();
      }
    },
  );
};

export const getSeriesAndManufacturerById = cache(
  async (seriesId: Series["id"], manufacturerId: Manufacturer["id"]) => {
    return getTracer().startActiveSpan(
      "getSeriesAndManufacturerById",
      async (span) => {
        try {
          return await Promise.all([
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
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
          });
          throw error;
        } finally {
          span.end();
        }
      },
    );
  },
);

export const getManufacturers = () => {
  return getTracer().startActiveSpan("getManufacturers", async (span) => {
    try {
      return await prisma.manufacturer.findMany({
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
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
};

export const getManufacturerById = (manufacturerId: Manufacturer["id"]) => {
  return getTracer().startActiveSpan("getManufacturerById", async (span) => {
    try {
      return await prisma.manufacturer.findUnique({
        where: {
          id: manufacturerId,
        },
        include: {
          image: true,
        },
      });
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
};
