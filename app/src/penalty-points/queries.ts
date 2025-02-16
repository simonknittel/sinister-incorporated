import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import type { Entity, PenaltyEntry } from "@prisma/client";

export const getEntriesGroupedByCitizen = async () => {
  return getTracer().startActiveSpan("getAllEntries", async (span) => {
    try {
      const authentication = await requireAuthentication();
      await authentication.authorize("penaltyEntry", "read");

      const now = new Date();

      const entries = await prisma.penaltyEntry.findMany({
        where: {
          deletedAt: null,
          OR: [
            {
              expiresAt: {
                gte: now,
              },
            },
            {
              expiresAt: null,
            },
          ],
        },
        include: {
          citizen: true,
          createdBy: true,
        },
      });

      const groupedEntries = new Map<
        Entity["id"],
        {
          citizen: Entity;
          totalPoints: number;
          entries: (PenaltyEntry & { createdBy: Entity })[];
        }
      >();

      for (const entry of entries) {
        if (!groupedEntries.has(entry.citizenId)) {
          groupedEntries.set(entry.citizenId, {
            citizen: entry.citizen,
            totalPoints: 0,
            entries: [],
          });
        }

        const mapEntry = groupedEntries.get(entry.citizenId)!;
        mapEntry.entries.push(entry);

        mapEntry.totalPoints += entry.points;
      }

      return groupedEntries;
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
