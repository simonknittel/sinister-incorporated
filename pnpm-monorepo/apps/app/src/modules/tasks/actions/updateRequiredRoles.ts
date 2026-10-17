"use server";

import { createTaskUpdateAction } from "../utils/createTaskUpdateAction";

export const updateRequiredRoles = createTaskUpdateAction(
  "updateRequiredRoles",
  {
    parseFormData: (formData) => ({
      task_id: formData.get("id"),
      required_role_ids: formData.getAll("requiredRole[]"),
      hidden_for_other_roles: formData.has("hiddenForOtherRoles"),
    }),
    successMessage: "Erfolgreich gespeichert.",
  },
);
