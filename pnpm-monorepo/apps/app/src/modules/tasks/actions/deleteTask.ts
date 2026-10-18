"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  deleteTaskInputSchema,
  deleteTask as deleteTaskUseCase,
  type DeleteTaskOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { TASK_ERROR_TEXTS } from "../utils/taskErrorTexts";

export const deleteTask = createAuthenticatedAction(
  "deleteTask",
  deleteTaskInputSchema,
  async (formData, authentication, data, t) => {
    let result: DeleteTaskOutput;
    try {
      result = await deleteTaskUseCase(
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

    return {
      success: t("Common.successfullyDeleted"),
      ...(result.notifications_sent
        ? {}
        : { warning: t("Common.notificationsFailed") }),
    };
  },
  { parseFormData: (formData) => ({ task_id: formData.get("id") }) },
);
