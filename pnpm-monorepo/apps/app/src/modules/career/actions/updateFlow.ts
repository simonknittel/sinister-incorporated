"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateFlowInputSchema,
  updateFlow as updateFlowUseCase,
} from "@sam-monorepo/application";
import { CAREER_ERROR_TEXTS } from "../utils/careerErrorTexts";

export const updateFlow = createUseCaseAction({
  name: "updateFlow",
  schema: updateFlowInputSchema,
  useCase: updateFlowUseCase,
  parseFormData: (formData) => ({
    flow_id: formData.get("flowId"),
    nodes: JSON.parse(formData.get("nodes") as string) as unknown,
    edges: JSON.parse(formData.get("edges") as string) as unknown,
  }),
  texts: CAREER_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
