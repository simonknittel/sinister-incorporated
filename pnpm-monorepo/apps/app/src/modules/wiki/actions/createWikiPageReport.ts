"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  createWikiPageReportInputSchema,
  createWikiPageReport as createWikiPageReportUseCase,
  type CreateWikiPageReportOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { WIKI_ERROR_TEXTS } from "../utils/wikiErrorTexts";

export const createWikiPageReport = createAuthenticatedAction(
  "createWikiPageReport",
  createWikiPageReportInputSchema,
  async (formData, authentication, data, t) => {
    let result: CreateWikiPageReportOutput;
    try {
      result = await createWikiPageReportUseCase(
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

    return {
      success: "Meldung gesendet.",
      ...(result.notifications_sent
        ? {}
        : { warning: t("Common.notificationsFailed") }),
    };
  },
  {
    parseFormData: (formData) => ({
      page_id: formData.get("pageId"),
      /** Only the form of an attachment sends the field */
      upload_id: formData.get("uploadId") ?? undefined,
      message: formData.get("message"),
    }),
  },
);
