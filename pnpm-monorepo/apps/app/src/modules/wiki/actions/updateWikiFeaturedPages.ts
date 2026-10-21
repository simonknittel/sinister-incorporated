"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateWikiFeaturedPagesInputSchema,
  updateWikiFeaturedPages as updateWikiFeaturedPagesUseCase,
} from "@sam-monorepo/application";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const updateWikiFeaturedPages = createUseCaseAction({
  name: "updateWikiFeaturedPages",
  schema: updateWikiFeaturedPagesInputSchema,
  useCase: updateWikiFeaturedPagesUseCase,
  /** One `pageId` field for each page, in the sequence of the landing page */
  parseFormData: (formData) => ({ page_ids: formData.getAll("pageId") }),
  texts: WIKI_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
