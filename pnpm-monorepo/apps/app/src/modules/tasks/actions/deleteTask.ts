"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  deleteTaskInputSchema,
  deleteTask as deleteTaskUseCase,
} from "@sam-monorepo/application";
import { TASK_ERROR_TEXTS } from "../utils/taskErrorTexts";

export const deleteTask = createUseCaseAction({
  name: "deleteTask",
  schema: deleteTaskInputSchema,
  useCase: deleteTaskUseCase,
  parseFormData: (formData) => ({ task_id: formData.get("id") }),
  texts: TASK_ERROR_TEXTS,
  success: (t) => t("Common.successfullyDeleted"),
  warning: (t, result) =>
    result.notifications_sent ? undefined : t("Common.notificationsFailed"),
});
