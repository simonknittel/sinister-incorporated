import { getApplicationContext, toActor } from "@/modules/application";
import { log } from "@/modules/logging";
import { findEventOptions } from "@sam-monorepo/application";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";

export const getAllEvents = protectedProcedure.query(async ({ ctx }) => {
  try {
    return await findEventOptions(
      getApplicationContext(),
      await toActor(ctx.session),
    );
  } catch (error) {
    log.error("Failed to fetch all events", {
      error,
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch all events",
    });
  }
});
