import type { ApplicationErrorTexts } from "@/modules/application";
import { SilcErrorMessage } from "@sam-monorepo/application";

/** The text of the app for a receiver of SILC that is missing or deleted */
export const INACTIVE_RECEIVER_ERROR =
  "Mindestens ein Citizen existiert nicht oder ist gelöscht.";

/**
 * The texts of the SILC actions for the errors of their use cases. The
 * other errors get the common text of their error class.
 */
export const SILC_ERROR_TEXTS: ApplicationErrorTexts = {
  [SilcErrorMessage.InactiveReceiver]: INACTIVE_RECEIVER_ERROR,
  [SilcErrorMessage.DuplicateSalaryDay]:
    "Eine Rolle kann nur ein Gehalt pro Tag haben.",
};
