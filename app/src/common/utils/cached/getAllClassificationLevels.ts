import { prisma } from "@/db";
import { cache } from "react";

const getAllClassificationLevels = cache(async () => {
  return prisma.classificationLevel.findMany({
    orderBy: {
      name: "asc",
    },
  });
});

export default getAllClassificationLevels;
