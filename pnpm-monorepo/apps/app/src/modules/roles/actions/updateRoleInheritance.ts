"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateRoleInheritanceInputSchema,
  updateRoleInheritance as updateRoleInheritanceUseCase,
} from "@sam-monorepo/application";
import { getRoleErrorTexts } from "../utils/roleErrorTexts";

export const updateRoleInheritance = createUseCaseAction({
  name: "updateRoleInheritance",
  schema: updateRoleInheritanceInputSchema,
  useCase: updateRoleInheritanceUseCase,
  parseFormData: (formData) => ({
    role_id: formData.get("id"),
    inherited_role_ids: formData.getAll("roles"),
  }),
  texts: getRoleErrorTexts,
  success: (t) => t("Common.successfullySaved"),
});
