"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  createCitizenLogInputSchema,
  createCitizenLog as createCitizenLogUseCase,
} from "@sam-monorepo/application";
import { CITIZEN_ERROR_TEXTS } from "../utils/citizenErrorTexts";

export const createCitizenLog = createUseCaseAction({
  name: "createCitizenLog",
  schema: createCitizenLogInputSchema,
  useCase: createCitizenLogUseCase,
  /** The fields of a note are absent for an identity log */
  parseFormData: (formData) => ({
    citizen_id: formData.get("citizenId"),
    type: formData.get("type"),
    content: formData.get("content"),
    note_type_id: formData.get("noteTypeId"),
    classification_level_id: formData.get("classificationLevelId"),
  }),
  texts: CITIZEN_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
