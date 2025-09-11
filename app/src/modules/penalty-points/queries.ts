import { prisma } from "@/db";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { type Entity, type PenaltyEntry } from "@prisma/client";
import { forbidden } from "next/navigation";
import { cache } from "react";

export const getEntriesGroupedByCitizen = withTrace(
  "getEntriesGroupedByCitizen",
  async () => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("penaltyEntry", "read"))) forbidden();

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
  },
);

export const getEntriesOfCitizen = withTrace(
  "getEntriesOfCitizen",
  async (citizenId: Entity["id"]) => {
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
  },
);

export const getPenaltyEntriesOfCurrentUser = cache(
  withTrace("getPenaltyEntriesOfCurrentUser", async () => {
    const authentication = await requireAuthentication();
    if (!authentication.session.entity) throw new Error("Forbidden");
    if (!(await authentication.authorize("ownPenaltyEntry", "read")))
      throw new Error("Forbidden");

    const now = new Date();

    return prisma.penaltyEntry.findMany({
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
  }),
);
