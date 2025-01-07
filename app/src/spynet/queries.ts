import { prisma } from "@/db";
import { cache } from "react";

export const getAllNoteTypes = cache(async () => {
  return prisma.noteType.findMany({
    orderBy: {
      name: "asc",
    },
  });
});

export const getAllClassificationLevels = cache(async () => {
  return prisma.classificationLevel.findMany({
    orderBy: {
      name: "asc",
    },
  });
});
