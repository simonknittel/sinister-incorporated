"use server";

import { createUseCaseAction } from "@/modules/application";
import { dropTask, dropTaskInputSchema } from "@sam-monorepo/application";
import { TASK_ERROR_TEXTS } from "../utils/taskErrorTexts";

export const deleteTaskAssignmentForCurrentUser = createUseCaseAction({
  name: "deleteTaskAssignmentForCurrentUser",
  schema: dropTaskInputSchema,
  useCase: dropTask,
  parseFormData: (formData) => ({ task_id: formData.get("taskId") }),
  texts: TASK_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
