import { prisma } from "@/db";
import { withTrace } from "@/tracing/utils/withTrace";
import type { Entity } from "@prisma/client";
import { cache } from "react";

export const getCitizens = withTrace("getCitizens", async () => {
  return prisma.entity.findMany();
});

export const getCitizenById = cache(
  withTrace("getCitizenById", async (id: Entity["id"]) => {
    return prisma.entity.findUnique({
      where: {
        id,
      },
    });
  }),
);
