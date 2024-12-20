import { updateObject } from "@/algolia";
import { prisma } from "@/db";
import { type EntityLog } from "@prisma/client";
import { type EntityLogType } from "../../../../../../../../types";

export async function updateAlgoliaWithGenericLogType(
  type: EntityLogType,
  algoliaKey: string,
  log: EntityLog,
) {
  const logs = await prisma.entityLog.findMany({
    where: {
      type,
      entityId: log.entityId,
      attributes: {
        some: {
          key: "confirmed",
          value: "confirmed",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  await updateObject(log.entityId, {
    [algoliaKey]: logs.map((log) => log.content),
  });
}
