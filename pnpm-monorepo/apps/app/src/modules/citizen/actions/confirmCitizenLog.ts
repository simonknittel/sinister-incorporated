"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  confirmCitizenLogInputSchema,
  confirmCitizenLog as confirmCitizenLogUseCase,
} from "@sam-monorepo/application";
import { CITIZEN_ERROR_TEXTS } from "../utils/citizenErrorTexts";

/**
 * Confirms a log or marks it as a false report. The logs of a deleted
 * citizen are read only.
 */
export const confirmCitizenLog = createUseCaseAction({
  name: "confirmCitizenLog",
  schema: confirmCitizenLogInputSchema,
  useCase: confirmCitizenLogUseCase,
  parseFormData: (formData) => ({
    log_id: formData.get("id"),
    confirmed: formData.get("confirmed"),
  }),
  texts: CITIZEN_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
