"use server";

import { createTaskUpdateAction } from "../utils/createTaskUpdateAction";

export const updateTaskTitle = createTaskUpdateAction("updateTaskTitle", {
  parseFormData: (formData) => ({
    task_id: formData.get("id"),
    title: formData.get("title"),
  }),
});
