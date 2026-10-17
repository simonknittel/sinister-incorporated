"use server";

import { createTaskUpdateAction } from "../utils/createTaskUpdateAction";

export const updateTaskRewardSilcValue = createTaskUpdateAction(
  "updateTaskRewardSilcValue",
  {
    parseFormData: (formData) => ({
      task_id: formData.get("id"),
      reward_silc_value: Number(formData.get("rewardSilcValue")),
    }),
  },
);
