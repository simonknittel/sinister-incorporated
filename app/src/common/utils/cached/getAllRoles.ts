import { prisma } from "@/db";
import { cache } from "react";

export const getAllRoles = cache(async () => {
  return prisma.role.findMany();
});
