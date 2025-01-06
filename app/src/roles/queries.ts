import { prisma } from "@/db";
import type { Role } from "@prisma/client";
import { cache } from "react";

export const getRoleById = cache(async (id: Role["id"]) => {
  return prisma.role.findUnique({
    where: {
      id,
    },
    include: {
      permissionStrings: true,
    },
  });
});

export const getRoles = cache(async () => {
  return prisma.role.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      permissionStrings: true,
    },
  });
});
