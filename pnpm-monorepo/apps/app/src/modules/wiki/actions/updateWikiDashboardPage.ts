"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateWikiDashboardPageInputSchema,
  updateWikiDashboardPage as updateWikiDashboardPageUseCase,
} from "@sam-monorepo/application";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const updateWikiDashboardPage = createUseCaseAction({
  name: "updateWikiDashboardPage",
  schema: updateWikiDashboardPageInputSchema,
  useCase: updateWikiDashboardPageUseCase,
  /** An empty value removes the page from the dashboard */
  parseFormData: (formData) => ({ page_id: formData.get("pageId") || null }),
  texts: WIKI_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
