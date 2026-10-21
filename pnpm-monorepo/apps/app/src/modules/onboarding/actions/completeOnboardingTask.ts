"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import {
  completeOnboardingTaskInputSchema,
  completeOnboardingTask as completeOnboardingTaskUseCase,
} from "@sam-monorepo/application";
import { OnboardingTaskCompletionMethod } from "@sam-monorepo/database/client";

export const completeOnboardingTask = createUseCaseAction({
  name: "completeOnboardingTask",
  schema: completeOnboardingTaskInputSchema,
  useCase: completeOnboardingTaskUseCase,
  parseFormData: (formData) => ({
    task_key: formData.get("taskKey"),
    completion_method: formData.get("completionMethod"),
  }),
  /**
   * Deliberately no `refresh()`: the onboarding state is resolved in the
   * `/app` layout, so a refresh would re-render the whole shell
   * underneath the open popover. The onboarding context holds the
   * optimistic state instead.
   */
  refresh: ActionRefresh.Never,
  success: (t, result) =>
    result.completion_method === OnboardingTaskCompletionMethod.SKIPPED
      ? "Die Aufgabe wurde als erledigt markiert."
      : "Die Aufgabe wurde abgeschlossen.",
});
