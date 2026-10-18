import { getApplicationContext, toActor } from "@/modules/application";
import { listAllCitizens } from "@sam-monorepo/application";
import { protectedProcedure, toTrpcError } from "../../trpc";

export const getAllCitizens = protectedProcedure.query(async ({ ctx }) => {
  try {
    return await listAllCitizens(
      getApplicationContext(),
      await toActor(ctx.session),
    );
  } catch (error) {
    throw toTrpcError(error, "Failed to fetch citizens");
  }
});
