"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import { dropTask, dropTaskInputSchema } from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapTaskErrorToActionResponse } from "../utils/mapTaskErrorToActionResponse";

export const deleteTaskAssignmentForCurrentUser = createAuthenticatedAction(
  "deleteTaskAssignmentForCurrentUser",
  dropTaskInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await dropTask(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapTaskErrorToActionResponse(error, { formData, t });
    }

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  { parseFormData: (formData) => ({ task_id: formData.get("taskId") }) },
);
