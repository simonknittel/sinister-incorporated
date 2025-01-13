import { prisma } from "@/db";
import type { Role } from "@prisma/client";
import { cache } from "react";

/**
 * Use the methods from `getRoles.ts` preferably for correct permission management.
 */
export const getRoleById = cache(async (id: Role["id"]) => {
  return prisma.role.findUnique({
    where: {
      id,
    },
    include: {
      permissionStrings: true,
      inherits: true,
    },
  });
});

/**
 * Use the methods from `getRoles.ts` preferably for correct permission management.
 */
export const getRoles = cache(async (withPermissionStrings = false) => {
  return prisma.role.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      permissionStrings: withPermissionStrings,
      inherits: true,
    },
  });
});
