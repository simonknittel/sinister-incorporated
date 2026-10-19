import { getApplicationContext, toActor } from "@/modules/application";
import {
  getManageableWikiPageTargets,
  getReadableWikiPageTargets,
} from "@/modules/wiki/utils/getWikiPageTargets";
import {
  findReadableWikiScope,
  idSchema,
  toWikiScopeTarget,
  wikiScopeInputSchema,
  WikiScopeKind,
} from "@sam-monorepo/application";
import * as z from "zod";
import { protectedProcedure, toTrpcError } from "../../trpc";

/**
 * Pages in depth-first tree order for hierarchy selects: managed ones for
 * the "Neue Seite" and "Seite verschieben" dialogs (default), readable ones
 * e.g. for the page-index config. A container scopes the tree to that
 * event's or template's briefing, gated like the other briefing surfaces; a
 * variantId to the subtree embedded on that variant's page, gated like its
 * routes — this is what keeps the embed's create/move targets inside the
 * subtree.
 */
export const getPageTargets = protectedProcedure
  .input(
    wikiScopeInputSchema
      .safeExtend({
        permission: z.enum(["manage", "read"]),
        /** The page to move: it and its subtree cannot be the new parent */
        excludeSubtreeOf: idSchema.optional(),
      })
      .optional(),
  )
  .query(async ({ ctx, input }) => {
    try {
      const scope = await findReadableWikiScope(
        getApplicationContext(),
        await toActor(ctx.session),
        toWikiScopeTarget(input ?? {}),
      );
      if (!scope) return [];

      /** The embed of a variant has its linked page as its root */
      const rootPageId =
        scope.kind === WikiScopeKind.Variant ? scope.rootPage.id : undefined;

      return input?.permission === "read"
        ? getReadableWikiPageTargets(scope, rootPageId)
        : getManageableWikiPageTargets(
            scope,
            input?.excludeSubtreeOf,
            rootPageId,
          );
    } catch (error) {
      throw toTrpcError(error, "Failed to fetch wiki page targets");
    }
  });
