import { getApplicationContext } from "@/modules/application";
import { listAssumableUsers } from "@sam-monorepo/application";
import { adminProcedure, toTrpcError } from "../../trpc";

export const getAssumableUsers = adminProcedure.query(async ({ ctx }) => {
  try {
    return await listAssumableUsers(getApplicationContext(), {
      admin_user_id: ctx.session.assumedByAdminId ?? ctx.session.user.id,
    });
  } catch (error) {
    throw toTrpcError(error, "Failed to fetch assumable users");
  }
});
