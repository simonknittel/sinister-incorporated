"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateFlowRoleAccessInputSchema,
  updateFlowRoleAccess as updateFlowRoleAccessUseCase,
} from "@sam-monorepo/application";

export const updateFlowRoleAccess = createUseCaseAction({
  name: "updateFlowRoleAccess",
  schema: updateFlowRoleAccessInputSchema,
  useCase: updateFlowRoleAccessUseCase,
  parseFormData: (formData) => ({
    flow_id: formData.get("flowId"),
    read_role_ids: formData.getAll("readRoleId[]"),
    update_role_ids: formData.getAll("updateRoleId[]"),
  }),
  success: (t) => t("Common.successfullySaved"),
});
