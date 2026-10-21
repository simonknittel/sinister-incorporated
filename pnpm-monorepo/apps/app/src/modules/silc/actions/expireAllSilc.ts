"use server";

import { createUseCaseAction } from "@/modules/application";
import { expireAllSilc as expireAllSilcUseCase } from "@sam-monorepo/application";
import * as z from "zod";

const schema = z.object({});

export const expireAllSilc = createUseCaseAction({
  name: "expireAllSilc",
  schema,
  useCase: expireAllSilcUseCase,
  success: () => "Erfolgreich gespeichert.",
});
