import { getApplicationContext, toActor } from "@/modules/application";
import {
  findWikiLinkablePages,
  toWikiScopeTarget,
  wikiScopeInputSchema,
} from "@sam-monorepo/application";
import { protectedProcedure, toTrpcError } from "../../trpc";

/**
 * All pages that a page of the scope can link to, by id, with the label,
 * the icon and the route of the link: for the "[[" suggestion of the editor
 * and for the page links that the editor adds after the render. The render
 * of a page sends only the pages that its content links to, thus the full
 * list loads only when an editor needs it. The scope and the gate are the
 * same as for `getPageTargets`.
 */
export const getLinkablePages = protectedProcedure
  .input(wikiScopeInputSchema.optional())
  .query(async ({ ctx, input }) => {
    try {
      return await findWikiLinkablePages(
        getApplicationContext(),
        await toActor(ctx.session),
        toWikiScopeTarget(input ?? {}),
      );
    } catch (error) {
      throw toTrpcError(error, "Failed to load linkable wiki pages");
    }
  });
