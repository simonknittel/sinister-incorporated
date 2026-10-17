"use server";

import { createTaskUpdateAction } from "../utils/createTaskUpdateAction";

export const updateTaskDescription = createTaskUpdateAction(
  "updateTaskDescription",
  {
    parseFormData: (formData) => ({
      task_id: formData.get("id"),
      description: formData.get("description"),
    }),
  },
);
