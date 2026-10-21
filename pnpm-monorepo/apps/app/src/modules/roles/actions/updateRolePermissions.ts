"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateRolePermissionsInputSchema,
  updateRolePermissions as updateRolePermissionsUseCase,
} from "@sam-monorepo/application";
import { getRoleErrorTexts } from "../utils/roleErrorTexts";

export const updateRolePermissions = createUseCaseAction({
  name: "updateRolePermissions",
  schema: updateRolePermissionsInputSchema,
  useCase: updateRolePermissionsUseCase,
  /** Each ticked checkbox sends its permission string as the field name */
  parseFormData: (formData) => ({
    role_id: formData.get("id"),
    permission_strings: Array.from(formData.keys()).filter(
      (key) => key !== "id" && !key.startsWith("$ACTION"),
    ),
  }),
  texts: getRoleErrorTexts,
  success: (t) => t("Common.successfullySaved"),
});
