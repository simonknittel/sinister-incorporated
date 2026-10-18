import { getApplicationContext, toActor } from "@/modules/application";
import { findAssignableRoleBadges } from "@sam-monorepo/application";
import { protectedProcedure, toTrpcError } from "../../trpc";

export const getAssignableRoles = protectedProcedure.query(async ({ ctx }) => {
  try {
    return await findAssignableRoleBadges(
      getApplicationContext(),
      await toActor(ctx.session),
    );
  } catch (error) {
    throw toTrpcError(error, "Failed to fetch assignable roles");
  }
});
