import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import {
  updateTask,
  updateTaskInputSchema,
  type NotifyingTaskWriteOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapTaskErrorToActionResponse } from "./mapTaskErrorToActionResponse";

interface Options {
  /** Maps the fields of the form to the input of `updateTask` */
  readonly parseFormData: (formData: FormData) => unknown;
  /** The text of the success. `Common.successfullySaved` by default. */
  readonly successMessage?: string;
}

/**
 * Factory for the update actions of the task page. Each form of the page
 * changes one field group of the task through the `updateTask` use case.
 */
export const createTaskUpdateAction = (
  actionName: string,
  { parseFormData, successMessage }: Options,
) =>
  createAuthenticatedAction(
    actionName,
    updateTaskInputSchema,
    async (formData, authentication, data, t) => {
      let result: NotifyingTaskWriteOutput;
      try {
        result = await updateTask(
          getApplicationContext(),
          await toActor(authentication.session),
          data,
        );
      } catch (error) {
        return mapTaskErrorToActionResponse(error, { formData, t });
      }

      refresh();

      return {
        success: successMessage ?? t("Common.successfullySaved"),
        ...(result.notifications_sent
          ? {}
          : { warning: t("Common.notificationsFailed") }),
      };
    },
    { parseFormData },
  );
