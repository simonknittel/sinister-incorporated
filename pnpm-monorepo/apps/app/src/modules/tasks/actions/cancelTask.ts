"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  cancelTaskInputSchema,
  cancelTask as cancelTaskUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { TASK_ERROR_TEXTS } from "../utils/taskErrorTexts";

export const cancelTask = createAuthenticatedAction(
  "cancelTask",
  cancelTaskInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await cancelTaskUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: TASK_ERROR_TEXTS,
      });
    }

    refresh();

    return { success: "Erfolgreich abgebrochen" };
  },
  { parseFormData: (formData) => ({ task_id: formData.get("id") }) },
);
