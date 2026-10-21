"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  deleteClassificationLevelInputSchema,
  deleteClassificationLevel as deleteClassificationLevelUseCase,
} from "@sam-monorepo/application";

export const deleteClassificationLevel = createUseCaseAction({
  name: "deleteClassificationLevel",
  schema: deleteClassificationLevelInputSchema,
  useCase: deleteClassificationLevelUseCase,
  parseFormData: (formData) => ({
    classification_level_id: formData.get("id"),
  }),
  success: (t) => t("Common.successfullyDeleted"),
});
