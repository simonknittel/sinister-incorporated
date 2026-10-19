"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  restoreEventTemplateInputSchema,
  restoreEventTemplate as restoreEventTemplateUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_TEMPLATE_ERROR_TEXTS } from "../utils/eventTemplateErrorTexts";

export const restoreEventTemplate = createAuthenticatedAction(
  "restoreEventTemplate",
  restoreEventTemplateInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await restoreEventTemplateUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: EVENT_TEMPLATE_ERROR_TEXTS,
      });
    }

    /** Also when a different tab or user restored the template before */
    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    parseFormData: (formData) => ({
      template_id: formData.get("templateId"),
    }),
  },
);
