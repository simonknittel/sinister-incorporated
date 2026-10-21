"use server";

import { createUseCaseAction } from "@/modules/application";
import { refreshSilcBalances as refreshSilcBalancesUseCase } from "@sam-monorepo/application";
import * as z from "zod";

const schema = z.object({});

export const refreshSilcBalances = createUseCaseAction({
  name: "refreshSilcBalances",
  schema,
  useCase: refreshSilcBalancesUseCase,
  success: () => "Erfolgreich gespeichert.",
});
