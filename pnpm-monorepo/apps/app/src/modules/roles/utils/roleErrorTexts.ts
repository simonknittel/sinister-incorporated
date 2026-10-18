import type { ApplicationErrorTexts } from "@/modules/application";
import {
  RoleAssignmentErrorMessage,
  RoleErrorMessage,
} from "@sam-monorepo/application";
import type { getTranslations } from "next-intl/server";

/**
 * The texts of the role and role-assignment actions for the errors of their
 * use cases. The other errors get the common text of their error class.
 */
export const getRoleErrorTexts = (
  t: Awaited<ReturnType<typeof getTranslations>>,
): ApplicationErrorTexts => ({
  [RoleErrorMessage.NameTaken]:
    "Eine Rolle mit diesem Namen existiert bereits.",
  [RoleAssignmentErrorMessage.CitizenDeleted]: "Der Citizen ist gelöscht.",
  // A different user removed the levels of the role
  [RoleAssignmentErrorMessage.RoleHasNoLevels]: t("Common.badRequest"),
});
