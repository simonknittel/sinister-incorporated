"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  createProfitDistributionCycleInputSchema,
  createProfitDistributionCycle as createProfitDistributionCycleUseCase,
} from "@sam-monorepo/application";
import { getProfitDistributionErrorTexts } from "../utils/profitDistributionErrorTexts";

export const createProfitDistributionCycle = createUseCaseAction({
  name: "createProfitDistributionCycle",
  schema: createProfitDistributionCycleInputSchema,
  useCase: createProfitDistributionCycleUseCase,
  parseFormData: (formData) => ({
    title: formData.get("title"),
    // Without the field, the schema refuses the request (not the date 1970)
    collection_ends_at: formData.get("collectionEndsAt") ?? undefined,
  }),
  texts: getProfitDistributionErrorTexts,
  redirect: (output) => `/app/sincome/${output.id}`,
});
