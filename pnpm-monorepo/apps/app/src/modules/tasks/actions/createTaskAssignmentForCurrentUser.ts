"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import { acceptTask, acceptTaskInputSchema } from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapTaskErrorToActionResponse } from "../utils/mapTaskErrorToActionResponse";

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
      return mapTaskErrorToActionResponse(error, { formData, t });
    }

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  { parseFormData: (formData) => ({ task_id: formData.get("taskId") }) },
);
