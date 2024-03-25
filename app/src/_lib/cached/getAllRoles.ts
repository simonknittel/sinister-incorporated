import { cache } from "react";
import { prisma } from "../../server/db";

const getAllRoles = cache(async () => {
  return prisma.role.findMany();
});

export default getAllRoles;
