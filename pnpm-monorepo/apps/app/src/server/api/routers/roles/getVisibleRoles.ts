import { getApplicationContext, toActor } from "@/modules/application";
import { findVisibleRoleBadges } from "@sam-monorepo/application";
import { protectedProcedure, toTrpcError } from "../../trpc";

export const getVisibleRoles = protectedProcedure.query(async ({ ctx }) => {
  try {
    return await findVisibleRoleBadges(
      getApplicationContext(),
      await toActor(ctx.session),
    );
  } catch (error) {
    throw toTrpcError(error, "Failed to fetch visible roles");
  }
});
