"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  createClassificationLevelInputSchema,
  createClassificationLevel as createClassificationLevelUseCase,
} from "@sam-monorepo/application";

export const createClassificationLevel = createUseCaseAction({
  name: "createClassificationLevel",
  schema: createClassificationLevelInputSchema,
  useCase: createClassificationLevelUseCase,
  success: () => "Erfolgreich hinzugefügt",
});
