import { z } from "zod";
import { authorize } from "~/app/_lib/auth/authenticateAndAuthorize";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const entityLogRouter = createTRPCRouter({
  getHistory: protectedProcedure
    .input(
      z.object({
        type: z.union([
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

        return authorize(ctx.session, [
          {
            resource: input.type,
            operation: "confirm",
          },
        ]);
      });

      return filteredLogs;
    }),
});
