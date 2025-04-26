import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import { type Entity, type PenaltyEntry } from "@prisma/client";
import { cache } from "react";

export const getEntriesGroupedByCitizen = async () => {
  return getTracer().startActiveSpan(
    "getEntriesGroupedByCitizen",
    async (span) => {
      try {
        const authentication = await requireAuthentication();
        if (!(await authentication.authorize("penaltyEntry", "read")))
          throw new Error("Forbidden");

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
    },
  );
};

export const getEntriesOfCitizen = async (citizenId: Entity["id"]) => {
  return getTracer().startActiveSpan("getEntriesOfCitizen", async (span) => {
    try {
      const authentication = await requireAuthentication();
      if (!authentication.session.entity) throw new Error("Forbidden");
      if (
        !(await authentication.authorize("penaltyEntry", "read")) &&
        !(
          citizenId === authentication.session.entity.id &&
          (await authentication.authorize("ownPenaltyEntry", "read"))
        )
      )
        throw new Error("Forbidden");

      const now = new Date();

      const entries = await prisma.penaltyEntry.findMany({
        where: {
          citizenId,
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

export const getPenaltyEntriesOfCurrentUser = cache(async () => {
  return getTracer().startActiveSpan(
    "getPenaltyEntriesOfCurrentUser",
    async (span) => {
      try {
        const authentication = await requireAuthentication();
        if (!authentication.session.entity) throw new Error("Forbidden");
        if (!(await authentication.authorize("ownPenaltyEntry", "read")))
          throw new Error("Forbidden");

        const now = new Date();

        return await prisma.penaltyEntry.findMany({
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
            citizenId: authentication.session.entity.id,
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
});
