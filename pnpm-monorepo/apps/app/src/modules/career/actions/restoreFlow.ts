"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  restoreFlowInputSchema,
  restoreFlow as restoreFlowUseCase,
} from "@sam-monorepo/application";
import { CAREER_ERROR_TEXTS } from "../utils/careerErrorTexts";

export const restoreFlow = createUseCaseAction({
  name: "restoreFlow",
  schema: restoreFlowInputSchema,
  useCase: restoreFlowUseCase,
  parseFormData: (formData) => ({
    flow_id: formData.get("flowId"),
    slug: formData.get("slug"),
  }),
  texts: CAREER_ERROR_TEXTS,
  success: () => "Der Karrierebaum wurde wiederhergestellt.",
});
