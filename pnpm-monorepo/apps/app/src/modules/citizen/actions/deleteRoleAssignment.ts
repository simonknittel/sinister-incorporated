"use server";

import { createUseCaseAction } from "@/modules/application";
import { getRoleErrorTexts } from "@/modules/roles/utils/roleErrorTexts";
import {
  deleteRoleAssignmentInputSchema,
  deleteRoleAssignment as deleteRoleAssignmentUseCase,
} from "@sam-monorepo/application";

export const deleteRoleAssignment = createUseCaseAction({
  name: "deleteRoleAssignment",
  schema: deleteRoleAssignmentInputSchema,
  useCase: deleteRoleAssignmentUseCase,
  parseFormData: (formData) => ({
    citizen_id: formData.get("citizenId"),
    role_id: formData.get("roleId"),
  }),
  texts: getRoleErrorTexts,
  success: (t) => t("Common.successfullySaved"),
});
