import type { ApplicationErrorTexts } from "@/modules/application";
import { UserErrorMessage } from "@sam-monorepo/application";

/**
 * The texts of the user actions for the errors of the user use cases. A
 * missing user and a missing permission get the common texts.
 */
export const USER_ERROR_TEXTS: ApplicationErrorTexts = {
  [UserErrorMessage.CannotBanSelf]: "Du kannst dich nicht selbst sperren.",
  [UserErrorMessage.CannotBanAdmin]:
    "Administratoren können nicht gesperrt werden.",
  [UserErrorMessage.AlreadyBanned]: "Dieser Benutzer ist bereits gesperrt.",
  [UserErrorMessage.NotBanned]: "Dieser Benutzer ist nicht gesperrt.",
};
