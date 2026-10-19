"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateWikiPageLinkInputSchema,
  updateWikiPageLink as updateWikiPageLinkUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const updateWikiPageLink = createAuthenticatedAction(
  "updateWikiPageLink",
  updateWikiPageLinkInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateWikiPageLinkUseCase(
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

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    parseFormData: (formData) => ({
      key: formData.get("key"),
      /** An empty value removes the link */
      page_id: formData.get("pageId") || null,
    }),
  },
);
