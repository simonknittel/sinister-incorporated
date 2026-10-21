"use server";

import { createUseCaseAction } from "@/modules/application";
import { getRoleErrorTexts } from "@/modules/roles/utils/roleErrorTexts";
import {
  changeRoleAssignmentLevelInputSchema,
  decreaseRoleAssignmentLevel as decreaseRoleAssignmentLevelUseCase,
} from "@sam-monorepo/application";

export const decreaseRoleAssignmentLevel = createUseCaseAction({
  name: "decreaseRoleAssignmentLevel",
  schema: changeRoleAssignmentLevelInputSchema,
  useCase: decreaseRoleAssignmentLevelUseCase,
  parseFormData: (formData) => ({
    citizen_id: formData.get("citizenId"),
    role_id: formData.get("roleId"),
  }),
  texts: getRoleErrorTexts,
  success: (t) => t("Common.successfullySaved"),
});
