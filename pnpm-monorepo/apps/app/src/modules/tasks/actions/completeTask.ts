"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  completeTaskInputSchema,
  completeTask as completeTaskUseCase,
  type NotifyingTaskWriteOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { TASK_ERROR_TEXTS } from "../utils/taskErrorTexts";

export const completeTask = createAuthenticatedAction(
  "completeTask",
  completeTaskInputSchema,
  async (formData, authentication, data, t) => {
    let result: NotifyingTaskWriteOutput;
    try {
      result = await completeTaskUseCase(
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
      success: "Erfolgreich abgeschlossen.",
      ...(result.notifications_sent
        ? {}
        : { warning: t("Common.notificationsFailed") }),
    };
  },
  {
    parseFormData: (formData) => ({
      task_id: formData.get("id"),
      completionist_ids: formData.getAll("completionistId[]"),
    }),
  },
);
