import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import type { DiscordEvent } from "@prisma/client";

export const getEventByDiscordId = async (discordId: DiscordEvent["id"]) => {
  return getTracer().startActiveSpan("getEventByDiscordId", async (span) => {
    try {
      return await prisma.discordEvent.findUnique({
        where: {
          discordId,
        },
        include: {
          positions: {
            include: {
              applications: {
                include: {
                  citizen: true,
                },
              },
              acceptedApplication: {
                include: {
                  citizen: true,
                },
              },
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
};
