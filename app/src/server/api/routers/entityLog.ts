import { authorize } from "@/auth/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const entityLogRouter = createTRPCRouter({
  getHistory: protectedProcedure
    .input(
      z.object({
        type: z.union([
          z.literal("handle"),
          z.literal("discord-id"),
          z.literal("teamspeak-id"),
          z.literal("community-moniker"),
          z.literal("citizen-id"),
        ]), // TODO: Infer from EntityLogType
        entityId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const allLogs = await ctx.prisma.entityLog.findMany({
        where: {
          entityId: input.entityId,
          type: input.type,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          attributes: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              createdBy: true,
            },
          },
          submittedBy: true,
        },
      });

      const filteredLogs = allLogs.filter((log) => {
        const confirmed = log.attributes.find(
          (attribute) => attribute.key === "confirmed",
        );

        if (confirmed && confirmed.value === "confirmed") return true;

        return authorize(ctx.session, input.type, "confirm");
      });

      return filteredLogs;
    }),
});
