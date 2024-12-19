import { prisma } from "@/db";
import { cache } from "react";

const getAllRoles = cache(async () => {
  return prisma.role.findMany();
});

export default getAllRoles;
