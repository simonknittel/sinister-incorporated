"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateEventTemplateRoleAccessInputSchema,
  updateEventTemplateRoleAccess as updateEventTemplateRoleAccessUseCase,
} from "@sam-monorepo/application";
import { EVENT_TEMPLATE_ERROR_TEXTS } from "../utils/eventTemplateErrorTexts";

export const updateEventTemplateRoleAccess = createUseCaseAction({
  name: "updateEventTemplateRoleAccess",
  schema: updateEventTemplateRoleAccessInputSchema,
  useCase: updateEventTemplateRoleAccessUseCase,
  parseFormData: (formData) => ({
    template_id: formData.get("templateId"),
    read_role_ids: formData.getAll("readRoleId[]"),
    edit_role_ids: formData.getAll("editRoleId[]"),
  }),
  texts: EVENT_TEMPLATE_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
