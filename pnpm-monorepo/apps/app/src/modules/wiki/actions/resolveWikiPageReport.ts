"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  resolveWikiPageReportInputSchema,
  resolveWikiPageReport as resolveWikiPageReportUseCase,
} from "@sam-monorepo/application";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const resolveWikiPageReport = createUseCaseAction({
  name: "resolveWikiPageReport",
  schema: resolveWikiPageReportInputSchema,
  useCase: resolveWikiPageReportUseCase,
  parseFormData: (formData) => ({
    report_id: formData.get("reportId"),
    resolution_comment: formData.get("resolutionComment") ?? undefined,
  }),
  texts: WIKI_ERROR_TEXTS,
  success: () => "Meldung als bearbeitet markiert.",
});
