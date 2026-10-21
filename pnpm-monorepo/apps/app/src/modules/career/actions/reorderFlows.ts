"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  reorderFlowsInputSchema,
  reorderFlows as reorderFlowsUseCase,
} from "@sam-monorepo/application";
import { CAREER_ERROR_TEXTS } from "../utils/careerErrorTexts";

export const reorderFlows = createUseCaseAction({
  name: "reorderFlows",
  schema: reorderFlowsInputSchema,
  useCase: reorderFlowsUseCase,
  parseFormData: (formData) => ({ flow_ids: formData.getAll("flowId[]") }),
  texts: CAREER_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
