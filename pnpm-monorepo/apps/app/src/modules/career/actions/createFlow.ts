"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  createFlowInputSchema,
  createFlow as createFlowUseCase,
} from "@sam-monorepo/application";
import { CAREER_ERROR_TEXTS } from "../utils/careerErrorTexts";

export const createFlow = createUseCaseAction({
  name: "createFlow",
  schema: createFlowInputSchema,
  useCase: createFlowUseCase,
  texts: CAREER_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
