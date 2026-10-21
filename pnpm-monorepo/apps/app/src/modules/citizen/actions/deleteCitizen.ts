"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  deleteCitizenInputSchema,
  deleteCitizen as deleteCitizenUseCase,
} from "@sam-monorepo/application";
import { CITIZEN_ERROR_TEXTS } from "../utils/citizenErrorTexts";

export const deleteCitizen = createUseCaseAction({
  name: "deleteCitizen",
  schema: deleteCitizenInputSchema,
  useCase: deleteCitizenUseCase,
  parseFormData: (formData) => ({ citizen_id: formData.get("id") }),
  texts: CITIZEN_ERROR_TEXTS,
  success: (t) => t("Common.successfullyDeleted"),
});
