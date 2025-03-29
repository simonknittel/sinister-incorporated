import { prisma } from "@/db";
import { log } from "@/logging";
import { TRPCError } from "@trpc/server";
import { serializeError } from "serialize-error";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const citizensRouter = createTRPCRouter({
  getAllCitizens: protectedProcedure.query(async () => {
    try {
      const citizens = await prisma.entity.findMany({
        where: {
          handle: {
            not: null,
          },
        },
        orderBy: {
          handle: "asc",
        },
      });

      return citizens;
    } catch (error) {
      void log.error("Failed to fetch citizens", {
        error: serializeError(error),
      });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch citizens",
      });
    }
  }),
});
