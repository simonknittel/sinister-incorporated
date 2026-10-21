"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateClassificationLevelInputSchema,
  updateClassificationLevel as updateClassificationLevelUseCase,
} from "@sam-monorepo/application";

export const updateClassificationLevel = createUseCaseAction({
  name: "updateClassificationLevel",
  schema: updateClassificationLevelInputSchema,
  useCase: updateClassificationLevelUseCase,
  parseFormData: (formData) => ({
    classification_level_id: formData.get("id"),
    name: formData.get("name"),
  }),
  success: () => "Erfolgreich bearbeitet",
});
