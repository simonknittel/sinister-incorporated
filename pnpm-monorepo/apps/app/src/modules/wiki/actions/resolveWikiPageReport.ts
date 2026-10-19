"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  resolveWikiPageReport as resolveWikiPageReportUseCase,
  resolveWikiPageReportInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const resolveWikiPageReport = createAuthenticatedAction(
  "resolveWikiPageReport",
  resolveWikiPageReportInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await resolveWikiPageReportUseCase(
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

    return { success: "Meldung als bearbeitet markiert." };
  },
  {
    parseFormData: (formData) => ({
      report_id: formData.get("reportId"),
      resolution_comment: formData.get("resolutionComment") ?? undefined,
    }),
  },
);
