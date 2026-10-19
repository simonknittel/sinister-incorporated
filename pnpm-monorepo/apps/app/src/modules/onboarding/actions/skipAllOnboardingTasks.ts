"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { skipAllOnboardingTasks as skipAllOnboardingTasksUseCase } from "@sam-monorepo/application";
import * as z from "zod";

const schema = z.object({});

export const skipAllOnboardingTasks = createAuthenticatedAction(
  "skipAllOnboardingTasks",
  schema,
  async (formData, authentication, _data, t) => {
    try {
      await skipAllOnboardingTasksUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    /**
     * Deliberately no `refresh()`, see `completeOnboardingTask`.
     */
    return { success: "Alle Aufgaben wurden als erledigt markiert." };
  },
);
