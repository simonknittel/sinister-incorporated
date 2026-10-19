"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  completeOnboardingTaskInputSchema,
  completeOnboardingTask as completeOnboardingTaskUseCase,
  type CompleteOnboardingTaskOutput,
} from "@sam-monorepo/application";
import { OnboardingTaskCompletionMethod } from "@sam-monorepo/database/client";

export const completeOnboardingTask = createAuthenticatedAction(
  "completeOnboardingTask",
  completeOnboardingTaskInputSchema,
  async (formData, authentication, data, t) => {
    let result: CompleteOnboardingTaskOutput;
    try {
      result = await completeOnboardingTaskUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    /**
     * Deliberately no `refresh()`: the onboarding state is resolved in the
     * `/app` layout, so a refresh would re-render the whole shell
     * underneath the open popover. The onboarding context holds the
     * optimistic state instead.
     */
    return {
      success:
        result.completion_method === OnboardingTaskCompletionMethod.SKIPPED
          ? "Die Aufgabe wurde als erledigt markiert."
          : "Die Aufgabe wurde abgeschlossen.",
    };
  },
  {
    parseFormData: (formData) => ({
      task_key: formData.get("taskKey"),
      completion_method: formData.get("completionMethod"),
    }),
  },
);
