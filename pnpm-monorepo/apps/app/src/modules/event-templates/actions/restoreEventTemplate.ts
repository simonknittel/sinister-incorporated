"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import {
  restoreEventTemplateInputSchema,
  restoreEventTemplate as restoreEventTemplateUseCase,
} from "@sam-monorepo/application";
import { EVENT_TEMPLATE_ERROR_TEXTS } from "../utils/eventTemplateErrorTexts";

export const restoreEventTemplate = createUseCaseAction({
  name: "restoreEventTemplate",
  schema: restoreEventTemplateInputSchema,
  useCase: restoreEventTemplateUseCase,
  parseFormData: (formData) => ({
    template_id: formData.get("templateId"),
  }),
  texts: EVENT_TEMPLATE_ERROR_TEXTS,
  /** Also when a different tab or user restored the template before */
  refresh: ActionRefresh.Always,
  success: (t) => t("Common.successfullySaved"),
});
