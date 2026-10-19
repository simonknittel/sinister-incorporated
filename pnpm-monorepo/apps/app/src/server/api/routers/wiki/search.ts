import { getApplicationContext, toActor } from "@/modules/application";
import {
  findWikiSearchResults,
  toWikiScopeTarget,
  wikiScopeInputSchema,
} from "@sam-monorepo/application";
import * as z from "zod";
import { protectedProcedure, toTrpcError } from "../../trpc";

/**
 * Full-text search over wiki pages (permission-filtered) and tags, for
 * search-as-you-type in the wiki sidebar and on the landing page. With a
 * container the search is limited to that event's or template's briefing
 * (the briefing sidebar), with a variantId to the subtree embedded on that
 * variant's page; the use case gates on the scope itself.
 */
export const search = protectedProcedure
  .input(
    wikiScopeInputSchema.safeExtend({
      query: z.string().trim().min(2).max(200),
    }),
  )
  .query(async ({ ctx, input }) => {
    try {
      return await findWikiSearchResults(
        getApplicationContext(),
        await toActor(ctx.session),
        { query: input.query, target: toWikiScopeTarget(input) },
      );
    } catch (error) {
      throw toTrpcError(error, "Failed to search the wiki");
    }
  });
