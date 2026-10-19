import { getApplicationContext, toActor } from "@/modules/application";
import { findEventOptions } from "@sam-monorepo/application";
import { protectedProcedure, toTrpcError } from "../../trpc";

export const getAllEvents = protectedProcedure.query(async ({ ctx }) => {
  try {
    return await findEventOptions(
      getApplicationContext(),
      await toActor(ctx.session),
    );
  } catch (error) {
    throw toTrpcError(error, "Failed to fetch all events");
  }
});
