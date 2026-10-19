import { getApplicationContext, toActor } from "@/modules/application";
import { eventContainerSchema } from "@/modules/events/utils/eventContainerSchema";
import {
  findWikiLinkablePages,
  idSchema,
  toWikiScopeTarget,
} from "@sam-monorepo/application";
import * as z from "zod";
import { protectedProcedure, toTrpcError } from "../../trpc";

/**
 * All pages a page of the scope can link to, by id, with the label, icon
 * and route of the link — for the editor's "[[" suggestion and for page
 * links inserted after the page was rendered. The page render itself sends
 * only the pages its content links to, so the full list is loaded only
 * when an editor needs it. Scoped and gated like `getPageTargets`.
 */
export const getLinkablePages = protectedProcedure
  .input(
    z
      .object({
        container: eventContainerSchema.optional(),
        variantId: idSchema.optional(),
      })
      .refine((input) => !(input.container && input.variantId), {
        message: "container and variantId are mutually exclusive",
      })
      .optional(),
  )
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
