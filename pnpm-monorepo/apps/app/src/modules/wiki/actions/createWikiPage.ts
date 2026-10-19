"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  createWikiPageInTree,
  createWikiPageInTreeInputSchema,
  idSchema,
  type CreateWikiPageInTreeOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";
import {
  buildWikiPageHref,
  createVariantWikiHrefMode,
  getWikiPageRouteHref,
} from "../utils/wikiPageHref";

/**
 * The use case takes the page. The variant is only for the redirect into
 * the embed of the variant.
 */
const schema = createWikiPageInTreeInputSchema.extend({
  variant_id: idSchema.optional(),
});

export const createWikiPage = createAuthenticatedAction(
  "createWikiPage",
  schema,
  async (formData, authentication, data, t) => {
    const { variant_id: variantId, ...input } = data;

    let result: CreateWikiPageInTreeOutput;
    try {
      result = await createWikiPageInTree(
        getApplicationContext(),
        await toActor(authentication.session),
        input,
        { variantId },
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: WIKI_ERROR_TEXTS,
      });
    }

    refresh();

    const page = { id: result.page_id, slug: result.slug };
    /** A new page is never the root page of a briefing */
    redirect(
      variantId && result.variant_wiki_page_id
        ? buildWikiPageHref(
            createVariantWikiHrefMode(variantId, result.variant_wiki_page_id),
            page,
          )
        : getWikiPageRouteHref({
            ...page,
            eventId: result.event_id,
            templateId: result.template_id,
          }),
    );
  },
  {
    parseFormData: (formData) => ({
      title: formData.get("title"),
      // An empty value creates a top-level page
      parent_id: formData.get("parentId") || undefined,
      variant_id: formData.get("variantId") || undefined,
      // An empty value creates an empty page
      copy_from_page_id: formData.get("copyFromPageId") || undefined,
      copy_children: formData.get("copyChildren") === "1",
    }),
  },
);
