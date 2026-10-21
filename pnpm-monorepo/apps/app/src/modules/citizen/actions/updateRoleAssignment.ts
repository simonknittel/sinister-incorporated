"use server";

import { createUseCaseAction } from "@/modules/application";
import { getRoleErrorTexts } from "@/modules/roles/utils/roleErrorTexts";
import {
  updateRoleAssignmentsInputSchema,
  updateRoleAssignments as updateRoleAssignmentsUseCase,
} from "@sam-monorepo/application";

/** A ticked role checkbox sends a field with this prefix and the role id */
const ROLE_FIELD_PREFIX = "role_";

export const updateRoleAssignments = createUseCaseAction({
  name: "updateRoleAssignments",
  schema: updateRoleAssignmentsInputSchema,
  useCase: updateRoleAssignmentsUseCase,
  parseFormData: (formData) => ({
    citizen_id: formData.get("citizenId"),
    role_ids: Array.from(formData.keys())
      .filter((key) => key.startsWith(ROLE_FIELD_PREFIX))
      .map((key) => key.slice(ROLE_FIELD_PREFIX.length)),
  }),
  texts: getRoleErrorTexts,
  success: (t) => t("Common.successfullySaved"),
  warning: (t, result) =>
    result.notifications_sent ? undefined : t("Common.notificationsFailed"),
});
