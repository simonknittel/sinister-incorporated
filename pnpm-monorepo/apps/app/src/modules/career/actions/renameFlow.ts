"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  renameFlowInputSchema,
  renameFlow as renameFlowUseCase,
} from "@sam-monorepo/application";
import { CAREER_ERROR_TEXTS } from "../utils/careerErrorTexts";

export const renameFlow = createUseCaseAction({
  name: "renameFlow",
  schema: renameFlowInputSchema,
  useCase: renameFlowUseCase,
  parseFormData: (formData) => ({
    flow_id: formData.get("flowId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
  }),
  texts: CAREER_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
