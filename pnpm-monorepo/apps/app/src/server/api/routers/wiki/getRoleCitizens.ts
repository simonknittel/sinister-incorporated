import { getApplicationContext, toActor } from "@/modules/application";
import { findWikiRoleCitizens } from "@sam-monorepo/application";
import * as z from "zod";
import { protectedProcedure, toTrpcError } from "../../trpc";

/**
 * The citizens of the role of a role-members node, for the node view of the
 * editor. The static render resolves the same role on the server without
 * this request. The attributes of a node are content of the document that a
 * user controls, thus the check of the id is loose: an unknown role and a
 * role that the user cannot see give no citizens.
 */
export const getRoleCitizens = protectedProcedure
  .input(z.object({ roleId: z.string().min(1).max(64) }))
  .query(async ({ ctx, input }) => {
    try {
      return await findWikiRoleCitizens(
        getApplicationContext(),
        await toActor(ctx.session),
        { roleId: input.roleId },
      );
    } catch (error) {
      throw toTrpcError(error, "Failed to resolve wiki role citizens");
    }
  });
