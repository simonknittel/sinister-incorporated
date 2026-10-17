"use server";

import { createTaskUpdateAction } from "../utils/createTaskUpdateAction";

export const updateTaskAssignments = createTaskUpdateAction(
  "updateTaskAssignments",
  {
    parseFormData: (formData) => {
      const assignmentLimit = formData.get("assignmentLimit");

      return {
        task_id: formData.get("id"),
        assignment_limit: assignmentLimit ? Number(assignmentLimit) : null,
        // No selected citizen removes all assignees
        assignee_ids: formData.getAll("assignedToId[]"),
      };
    },
    successMessage: "Erfolgreich gespeichert.",
  },
);
