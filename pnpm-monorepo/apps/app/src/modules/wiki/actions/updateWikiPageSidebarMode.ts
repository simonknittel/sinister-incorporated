"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateWikiPageSidebarModeInputSchema,
  updateWikiPageSidebarMode as updateWikiPageSidebarModeUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const updateWikiPageSidebarMode = createAuthenticatedAction(
  "updateWikiPageSidebarMode",
  updateWikiPageSidebarModeInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateWikiPageSidebarModeUseCase(
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

    /** Also when a different user or tab set the mode before */
    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    parseFormData: (formData) => ({
      page_id: formData.get("id"),
      sidebar_mode: formData.get("sidebarMode"),
    }),
  },
);
