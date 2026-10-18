"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { acceptTask, acceptTaskInputSchema } from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { TASK_ERROR_TEXTS } from "../utils/taskErrorTexts";

export const createTaskAssignmentForCurrentUser = createAuthenticatedAction(
  "createTaskAssignmentForCurrentUser",
  acceptTaskInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await acceptTask(
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

    return { success: t("Common.successfullySaved") };
  },
  { parseFormData: (formData) => ({ task_id: formData.get("taskId") }) },
);
