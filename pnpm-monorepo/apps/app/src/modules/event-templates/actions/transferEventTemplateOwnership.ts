"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import {
  transferEventTemplateOwnershipInputSchema,
  transferEventTemplateOwnership as transferEventTemplateOwnershipUseCase,
} from "@sam-monorepo/application";
import { EVENT_TEMPLATE_ERROR_TEXTS } from "../utils/eventTemplateErrorTexts";

export const transferEventTemplateOwnership = createUseCaseAction({
  name: "transferEventTemplateOwnership",
  schema: transferEventTemplateOwnershipInputSchema,
  useCase: transferEventTemplateOwnershipUseCase,
  parseFormData: (formData) => ({
    template_id: formData.get("templateId"),
    new_owner_id: formData.get("newOwnerId"),
  }),
  texts: EVENT_TEMPLATE_ERROR_TEXTS,
  /**
   * Also without a change: possibly a different tab or user transferred
   * the template before, and the page must show it.
   */
  refresh: ActionRefresh.Always,
  success: (t) => t("Common.successfullySaved"),
});
