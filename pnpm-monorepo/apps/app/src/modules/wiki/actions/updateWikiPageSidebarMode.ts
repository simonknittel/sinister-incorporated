"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import {
  updateWikiPageSidebarModeInputSchema,
  updateWikiPageSidebarMode as updateWikiPageSidebarModeUseCase,
} from "@sam-monorepo/application";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const updateWikiPageSidebarMode = createUseCaseAction({
  name: "updateWikiPageSidebarMode",
  schema: updateWikiPageSidebarModeInputSchema,
  useCase: updateWikiPageSidebarModeUseCase,
  parseFormData: (formData) => ({
    page_id: formData.get("id"),
    sidebar_mode: formData.get("sidebarMode"),
  }),
  texts: WIKI_ERROR_TEXTS,
  /** Also when a different user or tab set the mode before */
  refresh: ActionRefresh.Always,
  success: (t) => t("Common.successfullySaved"),
});
