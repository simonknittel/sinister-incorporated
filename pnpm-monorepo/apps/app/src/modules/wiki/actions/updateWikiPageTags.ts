"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateWikiPageTagsInputSchema,
  updateWikiPageTags as updateWikiPageTagsUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const updateWikiPageTags = createAuthenticatedAction(
  "updateWikiPageTags",
  updateWikiPageTagsInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateWikiPageTagsUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: WIKI_ERROR_TEXTS,
      });
    }

    /**
     * Also without changes: a different user or tab can have set the same
     * tags before
     */
    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    parseFormData: (formData) => ({
      page_id: formData.get("id"),
      tag_names: formData.getAll("tagName[]"),
    }),
  },
);
