"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateWikiPageLinkInputSchema,
  updateWikiPageLink as updateWikiPageLinkUseCase,
} from "@sam-monorepo/application";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const updateWikiPageLink = createUseCaseAction({
  name: "updateWikiPageLink",
  schema: updateWikiPageLinkInputSchema,
  useCase: updateWikiPageLinkUseCase,
  parseFormData: (formData) => ({
    key: formData.get("key"),
    /** An empty value removes the link */
    page_id: formData.get("pageId") || null,
  }),
  texts: WIKI_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
