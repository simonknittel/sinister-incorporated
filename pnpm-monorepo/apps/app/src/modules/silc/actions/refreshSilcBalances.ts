"use server";

import { createUseCaseAction } from "@/modules/application";
import { refreshSilcBalances as refreshSilcBalancesUseCase } from "@sam-monorepo/application";

export const refreshSilcBalances = createUseCaseAction({
  name: "refreshSilcBalances",
  useCase: refreshSilcBalancesUseCase,
  success: (t) => t("Common.successfullySaved"),
});
