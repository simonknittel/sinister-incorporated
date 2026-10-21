"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import {
  updateWikiPageTagsInputSchema,
  updateWikiPageTags as updateWikiPageTagsUseCase,
} from "@sam-monorepo/application";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const updateWikiPageTags = createUseCaseAction({
  name: "updateWikiPageTags",
  schema: updateWikiPageTagsInputSchema,
  useCase: updateWikiPageTagsUseCase,
  parseFormData: (formData) => ({
    page_id: formData.get("id"),
    tag_names: formData.getAll("tagName[]"),
  }),
  texts: WIKI_ERROR_TEXTS,
  /**
   * Also without changes: a different user or tab can have set the same
   * tags before
   */
  refresh: ActionRefresh.Always,
  success: (t) => t("Common.successfullySaved"),
});
