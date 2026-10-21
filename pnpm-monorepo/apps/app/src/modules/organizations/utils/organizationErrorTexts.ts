import type { Translations } from "@/modules/actions/utils/createAction";
import type { ApplicationErrorTexts } from "@/modules/application";
import { OrganizationErrorMessage } from "@sam-monorepo/application";

/**
 * The texts of the organization actions for the errors of their use cases.
 * The other errors get the common text of their error class.
 */
export const getOrganizationErrorTexts = (
  t: Translations,
): ApplicationErrorTexts => ({
  [OrganizationErrorMessage.SpectrumIdTaken]:
    "Eine Organisation mit dieser Spectrum ID existiert bereits.",
  [OrganizationErrorMessage.OrganizationNotFound]: t("Common.notFound"),
  [OrganizationErrorMessage.AlreadyConfirmed]:
    "Der Eintrag wurde bereits bestätigt.",
});
