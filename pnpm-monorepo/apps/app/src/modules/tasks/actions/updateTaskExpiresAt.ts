"use server";

import { createTaskUpdateAction } from "../utils/createTaskUpdateAction";

export const updateTaskExpiresAt = createTaskUpdateAction(
  "updateTaskExpiresAt",
  {
    parseFormData: (formData) => ({
      task_id: formData.get("id"),
      // The wall time of the form, in the time zone of the organization
      expires_at: formData.get("expiresAt") || null,
    }),
  },
);
