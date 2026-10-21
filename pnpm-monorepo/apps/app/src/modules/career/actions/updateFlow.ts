"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateFlowInputSchema,
  updateFlow as updateFlowUseCase,
} from "@sam-monorepo/application";

export const updateFlow = createUseCaseAction({
  name: "updateFlow",
  schema: updateFlowInputSchema,
  useCase: updateFlowUseCase,
  parseFormData: (formData) => ({
    flow_id: formData.get("flowId"),
    nodes: JSON.parse(formData.get("nodes") as string) as unknown,
    edges: JSON.parse(formData.get("edges") as string) as unknown,
  }),
  success: (t) => t("Common.successfullySaved"),
});
