"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  renameWikiPageInputSchema,
  renameWikiPage as renameWikiPageUseCase,
} from "@sam-monorepo/application";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const renameWikiPage = createUseCaseAction({
  name: "renameWikiPage",
  schema: renameWikiPageInputSchema,
  useCase: renameWikiPageUseCase,
  parseFormData: (formData) => ({
    page_id: formData.get("id"),
    title: formData.get("title"),
  }),
  texts: WIKI_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
