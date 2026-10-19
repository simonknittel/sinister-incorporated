import { eventContainerSchema } from "@/modules/events/utils/eventContainerSchema";
import { getApplicationContext, toActor } from "@/modules/application";
import {
  findWikiScopeTags,
  ForbiddenError,
  toWikiScopeTarget,
} from "@sam-monorepo/application";
import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { protectedProcedure, toTrpcError } from "../../trpc";

/**
 * The tags of one scope — the global wiki by default, a briefing with a
 * container — for the tag input's autocomplete (see `findWikiScopeTags()`).
 */
export const getTags = protectedProcedure
  .input(z.object({ container: eventContainerSchema.optional() }).optional())
  .query(async ({ ctx, input }) => {
    try {
      return await findWikiScopeTags(
        getApplicationContext(),
        await toActor(ctx.session),
        toWikiScopeTarget(input ?? {}),
      );
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new TRPCError({ code: "FORBIDDEN", message: error.message });

      throw toTrpcError(error, "Failed to load wiki tags");
    }
  });
