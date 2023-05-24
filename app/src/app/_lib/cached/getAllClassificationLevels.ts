import { cache } from "react";
import { prisma } from "~/server/db";

const getAllClassificationLevels = cache(async () => {
  return prisma.classificationLevel.findMany({
    orderBy: {
      name: "asc",
    },
  });
});

export default getAllClassificationLevels;
