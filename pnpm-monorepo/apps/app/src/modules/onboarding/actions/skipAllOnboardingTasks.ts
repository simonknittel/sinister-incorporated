"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import { skipAllOnboardingTasks as skipAllOnboardingTasksUseCase } from "@sam-monorepo/application";
import * as z from "zod";

const schema = z.object({});

export const skipAllOnboardingTasks = createUseCaseAction({
  name: "skipAllOnboardingTasks",
  schema,
  useCase: skipAllOnboardingTasksUseCase,
  /**
   * Deliberately no `refresh()`, see `completeOnboardingTask`.
   */
  refresh: ActionRefresh.Never,
  success: () => "Alle Aufgaben wurden als erledigt markiert.",
});
