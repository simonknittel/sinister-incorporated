"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  duplicateFlowInputSchema,
  duplicateFlow as duplicateFlowUseCase,
} from "@sam-monorepo/application";
import { CAREER_ERROR_TEXTS } from "../utils/careerErrorTexts";

export const duplicateFlow = createUseCaseAction({
  name: "duplicateFlow",
  schema: duplicateFlowInputSchema,
  useCase: duplicateFlowUseCase,
  parseFormData: (formData) => ({
    source_flow_id: formData.get("sourceFlowId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
  }),
  texts: CAREER_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
