"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateWikiDashboardPage as updateWikiDashboardPageUseCase,
  updateWikiDashboardPageInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const updateWikiDashboardPage = createAuthenticatedAction(
  "updateWikiDashboardPage",
  updateWikiDashboardPageInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateWikiDashboardPageUseCase(
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
    /** An empty value removes the page from the dashboard */
    parseFormData: (formData) => ({ page_id: formData.get("pageId") || null }),
  },
);
