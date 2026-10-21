"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import { skipAllOnboardingTasks as skipAllOnboardingTasksUseCase } from "@sam-monorepo/application";

export const skipAllOnboardingTasks = createUseCaseAction({
  name: "skipAllOnboardingTasks",
  useCase: skipAllOnboardingTasksUseCase,
  /**
   * Deliberately no `refresh()`, see `completeOnboardingTask`.
   */
  refresh: ActionRefresh.Never,
  success: () => "Alle Aufgaben wurden als erledigt markiert.",
});
