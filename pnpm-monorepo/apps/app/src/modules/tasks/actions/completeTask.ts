"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import {
  completeTaskInputSchema,
  completeTask as completeTaskUseCase,
  type NotifyingTaskWriteOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapTaskErrorToActionResponse } from "../utils/mapTaskErrorToActionResponse";

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
      return mapTaskErrorToActionResponse(error, { formData, t });
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
