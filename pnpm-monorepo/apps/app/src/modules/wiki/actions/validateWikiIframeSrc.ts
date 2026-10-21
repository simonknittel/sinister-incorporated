"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import {
  validateWikiIframeSrcInputSchema,
  validateWikiIframeSrc as validateWikiIframeSrcUseCase,
} from "@sam-monorepo/application";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const validateWikiIframeSrc = createUseCaseAction({
  name: "validateWikiIframeSrc",
  schema: validateWikiIframeSrcInputSchema,
  useCase: validateWikiIframeSrcUseCase,
  texts: WIKI_ERROR_TEXTS,
  refresh: ActionRefresh.Never,
  success: () => "Erlaubt.",
});
