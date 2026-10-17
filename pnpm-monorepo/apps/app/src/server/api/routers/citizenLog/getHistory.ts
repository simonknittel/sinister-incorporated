import { getApplicationContext, toActor } from "@/modules/application";
import type { GenericCitizenLogType } from "@/types";
import { getReadableCitizenLogWhere } from "@sam-monorepo/application";
import * as z from "zod";
import { protectedProcedure } from "../../trpc";

export const getHistory = protectedProcedure
  .input(
    z.object({
      type: z.enum([
        "handle",
        "discord-id",
        "teamspeak-id",
        "community-moniker",
        "citizen-id",
      ] satisfies GenericCitizenLogType[]),
      citizenId: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    /** The same rule as the Spynet log tables */
    const readableWhere = await getReadableCitizenLogWhere(
      getApplicationContext(),
      await toActor(ctx.session),
      [input.type],
    );

    return ctx.prisma.citizenLog.findMany({
      where: {
        AND: [{ citizenId: input.citizenId }, readableWhere],
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        citizenId: true,
        type: true,
        content: true,
        createdAt: true,
        confirmed: true,
        confirmedBy: { select: { name: true } },
        submittedBy: { select: { name: true } },
      },
    });
  });
