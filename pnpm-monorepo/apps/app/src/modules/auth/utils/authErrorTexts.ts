import type { ApplicationErrorTexts } from "@/modules/application";
import { AuthErrorMessage } from "@sam-monorepo/application";

/**
 * The texts of the auth actions for the errors of the auth use cases. A
 * message without a text gets the common text of its error class.
 */
export const AUTH_ERROR_TEXTS: ApplicationErrorTexts = {
  [AuthErrorMessage.OwnAccount]: "You cannot assume your own account.",
  [AuthErrorMessage.CurrentSession]:
    "Die aktuelle Sitzung kann nicht gelöscht werden.",
};
