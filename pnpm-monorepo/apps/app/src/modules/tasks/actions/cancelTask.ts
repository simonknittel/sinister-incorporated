"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import {
  cancelTaskInputSchema,
  cancelTask as cancelTaskUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapTaskErrorToActionResponse } from "../utils/mapTaskErrorToActionResponse";

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
      return mapTaskErrorToActionResponse(error, { formData, t });
    }

    refresh();

    return { success: "Erfolgreich abgebrochen" };
  },
  { parseFormData: (formData) => ({ task_id: formData.get("id") }) },
);
