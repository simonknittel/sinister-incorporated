"use server";

import { createTaskUpdateAction } from "../utils/createTaskUpdateAction";
import { parseWallTimeField } from "../utils/parseWallTimeField";

export const updateTaskExpiresAt = createTaskUpdateAction(
  "updateTaskExpiresAt",
  {
    parseFormData: (formData) => ({
      task_id: formData.get("id"),
      expires_at: parseWallTimeField(formData, "expiresAt"),
    }),
  },
);
