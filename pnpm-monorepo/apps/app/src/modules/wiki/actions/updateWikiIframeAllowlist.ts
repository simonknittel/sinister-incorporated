"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateWikiIframeAllowlist as updateWikiIframeAllowlistUseCase,
  updateWikiIframeAllowlistInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const updateWikiIframeAllowlist = createAuthenticatedAction(
  "updateWikiIframeAllowlist",
  updateWikiIframeAllowlistInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateWikiIframeAllowlistUseCase(
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
    /** One `domain` field for each hostname */
    parseFormData: (formData) => ({ domains: formData.getAll("domain") }),
  },
);
