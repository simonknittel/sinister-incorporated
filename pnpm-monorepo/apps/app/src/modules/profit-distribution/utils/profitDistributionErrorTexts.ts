import type { ApplicationErrorTexts } from "@/modules/application";
import { ProfitDistributionErrorMessage } from "@sam-monorepo/application";
import type { getTranslations } from "next-intl/server";

/**
 * The texts of the profit distribution actions for the errors of their use
 * cases. The other errors get the common text of their error class.
 */
export const getProfitDistributionErrorTexts = (
  t: Awaited<ReturnType<typeof getTranslations>>,
): ApplicationErrorTexts => ({
  // A different tab, a different manager or the midnight job changed the phase
  [ProfitDistributionErrorMessage.WrongPhase]: t("Common.badRequest"),
  [ProfitDistributionErrorMessage.CollectionEndInPast]:
    "Das Ende des Sammelzeitraums muss in der Zukunft liegen.",
});
