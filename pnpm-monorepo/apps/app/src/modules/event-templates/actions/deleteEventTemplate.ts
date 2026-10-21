"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import {
  deleteEventTemplateInputSchema,
  deleteEventTemplate as deleteEventTemplateUseCase,
} from "@sam-monorepo/application";
import { EVENT_TEMPLATE_ERROR_TEXTS } from "../utils/eventTemplateErrorTexts";

export const deleteEventTemplate = createUseCaseAction({
  name: "deleteEventTemplate",
  schema: deleteEventTemplateInputSchema,
  useCase: deleteEventTemplateUseCase,
  parseFormData: (formData) => ({
    template_id: formData.get("templateId"),
  }),
  texts: EVENT_TEMPLATE_ERROR_TEXTS,
  /** Also when a different tab or user deleted the template before */
  refresh: ActionRefresh.Always,
  success: (t) => t("Common.successfullyDeleted"),
});
