"use server";

import { createTaskUpdateAction } from "../utils/createTaskUpdateAction";

export const updateTaskRewardTypeTextValue = createTaskUpdateAction(
  "updateTaskRewardTypeTextValue",
  {
    parseFormData: (formData) => ({
      task_id: formData.get("id"),
      reward_text: formData.get("rewardTypeTextValue"),
    }),
  },
);
