import type { ApplicationErrorTexts } from "@/modules/application";
import { SilcErrorMessage } from "@sam-monorepo/application";
import { INACTIVE_RECEIVER_ERROR } from "./activeReceivers";

/**
 * The texts of the SILC actions for the errors of their use cases. The
 * other errors get the common text of their error class.
 */
export const SILC_ERROR_TEXTS: ApplicationErrorTexts = {
  [SilcErrorMessage.InactiveReceiver]: INACTIVE_RECEIVER_ERROR,
  [SilcErrorMessage.DuplicateSalaryDay]:
    "Eine Rolle kann nur ein Gehalt pro Tag haben.",
};
