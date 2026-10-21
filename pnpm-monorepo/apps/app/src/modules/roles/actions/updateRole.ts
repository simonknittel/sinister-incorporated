"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateRoleInputSchema,
  updateRole as updateRoleUseCase,
} from "@sam-monorepo/application";
import { getRoleErrorTexts } from "../utils/roleErrorTexts";

/** An empty number field removes the value */
const parseOptionalNumber = (value: FormDataEntryValue | null) =>
  value ? Number(value) : null;

export const updateRole = createUseCaseAction({
  name: "updateRole",
  schema: updateRoleInputSchema,
  useCase: updateRoleUseCase,
  parseFormData: (formData) => ({
    role_id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description") || null,
    max_age_days: parseOptionalNumber(formData.get("maxAgeDays")),
    assign_after_inactive_days: parseOptionalNumber(
      formData.get("assignAfterInactiveDays"),
    ),
    max_level: parseOptionalNumber(formData.get("maxLevel")),
  }),
  texts: getRoleErrorTexts,
  success: (t) => t("Common.successfullySaved"),
});
