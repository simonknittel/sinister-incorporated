"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateWikiFeaturedPages as updateWikiFeaturedPagesUseCase,
  updateWikiFeaturedPagesInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const updateWikiFeaturedPages = createAuthenticatedAction(
  "updateWikiFeaturedPages",
  updateWikiFeaturedPagesInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateWikiFeaturedPagesUseCase(
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
    /** One `pageId` field for each page, in the sequence of the landing page */
    parseFormData: (formData) => ({ page_ids: formData.getAll("pageId") }),
  },
);
