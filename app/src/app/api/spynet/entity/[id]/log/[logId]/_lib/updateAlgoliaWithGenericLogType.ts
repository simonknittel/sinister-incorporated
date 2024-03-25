import { type EntityLog } from "@prisma/client";
import { updateObject } from "../../../../../../../../lib/algolia";
import { prisma } from "../../../../../../../../server/db";
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
