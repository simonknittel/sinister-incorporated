"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  endPayoutInputSchema,
  endPayout as endPayoutUseCase,
} from "@sam-monorepo/application";
import { getProfitDistributionErrorTexts } from "../utils/profitDistributionErrorTexts";

export const endPayout = createUseCaseAction({
  name: "endPayout",
  schema: endPayoutInputSchema,
  useCase: endPayoutUseCase,
  parseFormData: (formData) => ({ cycle_id: formData.get("id") }),
  texts: getProfitDistributionErrorTexts,
  success: (t) => t("Common.successfullySaved"),
});
