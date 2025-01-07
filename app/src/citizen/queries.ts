import { prisma } from "@/db";

export const getCitizen = async () => {
  return prisma.entity.findMany();
};
