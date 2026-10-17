"use server";

import { createTaskUpdateAction } from "../utils/createTaskUpdateAction";

export const updateTaskRepeatable = createTaskUpdateAction(
  "updateTaskRepeatable",
  {
    parseFormData: (formData) => ({
      task_id: formData.get("id"),
      repeatable: Number(formData.get("repeatable")),
    }),
  },
);
