import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import type { DiscordEvent } from "@prisma/client";
import { cache } from "react";

export const getEventById = cache(async (id: DiscordEvent["id"]) => {
  return getTracer().startActiveSpan("getEventById", async (span) => {
    try {
      return await prisma.discordEvent.findUnique({
        where: {
          id,
        },
        include: {
          participants: true,
          positions: {
            include: {
              applications: {
                include: {
                  citizen: true,
                },
              },
              citizen: true,
              requiredVariant: {
                include: {
                  series: {
                    include: {
                      manufacturer: true,
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
});

export const getFutureEvents = cache(async () => {
  return getTracer().startActiveSpan("getEvents", async (span) => {
    try {
      const now = new Date();

      return await prisma.discordEvent.findMany({
        where: {
          startTime: {
            gte: now,
          },
        },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
        },
        orderBy: {
          startTime: "asc",
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
});
