import isAllowedToCreate from "@/app/app/spynet/entity/[id]/_components/notes/lib/isAllowedToCreate";
import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import type { NoteType } from "@prisma/client";
import { cache } from "react";

export const getAllClassificationLevelsDeduped = cache(async () => {
  return prisma.classificationLevel.findMany({
    orderBy: {
      name: "asc",
    },
  });
});

export const getCreatableClassificationLevelsDeduped = cache(
  async (noteTypeId: NoteType["id"]) => {
    const [authentication, allClassificationLevels] = await Promise.all([
      requireAuthentication(),
      getAllClassificationLevelsDeduped(),
    ]);

    const filteredClassificationLevels = (
      await Promise.all(
        allClassificationLevels.map(async (classificationLevel) => {
          return {
            classificationLevel,
            include: await isAllowedToCreate(
              classificationLevel.id,
              authentication,
              noteTypeId,
            ),
          };
        }),
      )
    )
      .filter(({ include }) => include)
      .map(({ classificationLevel }) => classificationLevel);

    return filteredClassificationLevels;
  },
);
