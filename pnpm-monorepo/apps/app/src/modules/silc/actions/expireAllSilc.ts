"use server";

import { createUseCaseAction } from "@/modules/application";
import { expireAllSilc as expireAllSilcUseCase } from "@sam-monorepo/application";

export const expireAllSilc = createUseCaseAction({
  name: "expireAllSilc",
  useCase: expireAllSilcUseCase,
  success: (t) => t("Common.successfullySaved"),
});
