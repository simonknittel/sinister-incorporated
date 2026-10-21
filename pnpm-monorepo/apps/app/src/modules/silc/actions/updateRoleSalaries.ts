"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateRoleSalariesInputSchema,
  updateRoleSalaries as updateRoleSalariesUseCase,
} from "@sam-monorepo/application";
import { SILC_ERROR_TEXTS } from "../utils/silcErrorTexts";

export const updateRoleSalaries = createUseCaseAction({
  name: "updateRoleSalaries",
  schema: updateRoleSalariesInputSchema,
  useCase: updateRoleSalariesUseCase,
  /** A row without a selected role sends no role id: the lengths differ */
  parseFormData: (formData) => ({
    role_ids: formData.getAll("roleId[]"),
    values: formData.getAll("value[]").map(Number),
    days_of_month: formData.getAll("dayOfMonth[]").map(Number),
  }),
  texts: SILC_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
