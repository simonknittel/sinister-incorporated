"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateFlowRoleAccessInputSchema,
  updateFlowRoleAccess as updateFlowRoleAccessUseCase,
} from "@sam-monorepo/application";
import { CAREER_ERROR_TEXTS } from "../utils/careerErrorTexts";

export const updateFlowRoleAccess = createUseCaseAction({
  name: "updateFlowRoleAccess",
  schema: updateFlowRoleAccessInputSchema,
  useCase: updateFlowRoleAccessUseCase,
  parseFormData: (formData) => ({
    flow_id: formData.get("flowId"),
    read_role_ids: formData.getAll("readRoleId[]"),
    update_role_ids: formData.getAll("updateRoleId[]"),
  }),
  texts: CAREER_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
