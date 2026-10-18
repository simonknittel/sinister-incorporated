import type { ApplicationErrorTexts } from "@/modules/application";
import {
  RoleAssignmentErrorMessage,
  RoleErrorMessage,
} from "@sam-monorepo/application";
import type { getTranslations } from "next-intl/server";

/**
 * The texts of the role actions for the errors of the role use cases. The
 * other errors get the common text of their error class.
 */
export const ROLE_ERROR_TEXTS: ApplicationErrorTexts = {
  [RoleErrorMessage.NameTaken]:
    "Eine Rolle mit diesem Namen existiert bereits.",
};

/**
 * The texts of the role-assignment actions for the errors of the
 * role-assignment use cases
 */
export const getRoleAssignmentErrorTexts = (
  t: Awaited<ReturnType<typeof getTranslations>>,
): ApplicationErrorTexts => ({
  [RoleAssignmentErrorMessage.CitizenDeleted]: "Der Citizen ist gelöscht.",
  // A different user removed the levels of the role
  [RoleAssignmentErrorMessage.RoleHasNoLevels]: t("Common.badRequest"),
});
