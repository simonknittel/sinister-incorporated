import type { ActionResponse } from "@/modules/actions/utils/createAction";
import { rejectConflict } from "@/modules/actions/utils/rejectConflict";
import { mapApplicationErrorToActionResponse } from "@/modules/application";
import { INACTIVE_RECEIVER_ERROR } from "@/modules/silc/utils/activeReceivers";
import {
  ConflictError,
  ForbiddenError,
  isTaskErrorMessage,
  NotFoundError,
  TaskErrorMessage,
  ValidationError,
} from "@sam-monorepo/application";
import type { getTranslations } from "next-intl/server";

export const CLOSED_TASK_ERROR = "Der Task ist bereits abgeschlossen.";
export const TASK_NOT_FOUND_ERROR = "Task nicht gefunden";

const TASK_ERROR_TEXTS: Readonly<Record<TaskErrorMessage, string>> = {
  [TaskErrorMessage.NotFound]: TASK_NOT_FOUND_ERROR,
  [TaskErrorMessage.NotOpen]: CLOSED_TASK_ERROR,
  [TaskErrorMessage.NotSelfAssignable]:
    "Du kannst deine Teilnahme an einem personalisierten Task nicht selbstständig ändern.",
  [TaskErrorMessage.AssignmentLimitReached]:
    "Dieser Task kann nicht von Weiteren angenommen werden.",
  [TaskErrorMessage.MissingRequiredRole]:
    "Du erfüllst nicht die Voraussetzungen für diesen Task.",
  [TaskErrorMessage.AlreadyAccepted]: "Du hast diesen Task bereits angenommen.",
  [TaskErrorMessage.NotAccepted]: "Du hast diesen Task nicht angenommen.",
  [TaskErrorMessage.NoCompletionist]:
    "Der Task kann nicht abgeschlossen werden, ohne dass ihn jemand erfüllt hat.",
  [TaskErrorMessage.InactiveCompletionist]: INACTIVE_RECEIVER_ERROR,
};

interface Options {
  readonly formData: FormData;
  readonly t: Awaited<ReturnType<typeof getTranslations>>;
}

/**
 * Maps an error of a task use case to the response of a task action, with
 * the German text of each task rule. A conflict and a missing task refresh
 * the page, thus it shows the current state of the task. Rethrows the errors
 * that are not typed errors of a use case.
 */
export const mapTaskErrorToActionResponse = (
  error: unknown,
  { formData, t }: Options,
): ActionResponse => {
  if (
    (error instanceof ConflictError || error instanceof NotFoundError) &&
    isTaskErrorMessage(error.message)
  )
    return rejectConflict(TASK_ERROR_TEXTS[error.message], formData);

  if (
    (error instanceof ForbiddenError || error instanceof ValidationError) &&
    isTaskErrorMessage(error.message)
  )
    return { error: TASK_ERROR_TEXTS[error.message], requestPayload: formData };

  return mapApplicationErrorToActionResponse(error, { formData, t });
};
