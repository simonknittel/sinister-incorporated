"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  completeOnboardingStepInputSchema,
  completeOnboardingStep as completeOnboardingStepUseCase,
} from "@sam-monorepo/application";

export const completeOnboardingStep = createAuthenticatedAction(
  "completeOnboardingStep",
  completeOnboardingStepInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await completeOnboardingStepUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    /**
     * Deliberately no `refresh()` on success, see `completeOnboardingTask`.
     * A not-found answer refreshes (the error mapper): only a crafted request
     * names a task or a step that does not exist.
     */
    return { success: "Fortschritt gespeichert." };
  },
  {
    parseFormData: (formData) => ({
      task_key: formData.get("taskKey"),
      step_key: formData.get("stepKey"),
    }),
  },
);
