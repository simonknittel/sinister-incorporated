import type { ApplicationErrorTexts } from "@/modules/application";
import { IamErrorMessage } from "@sam-monorepo/application";
import type { getTranslations } from "next-intl/server";

/**
 * The texts of the IAM actions for the errors of the IAM use cases. The
 * unknown role needs a request that bypassed the options of the form, or a
 * role that a different user deleted: it gets the text of a bad request.
 */
export const getIamErrorTexts = (
  t: Awaited<ReturnType<typeof getTranslations>>,
): ApplicationErrorTexts => ({
  [IamErrorMessage.UnknownRole]: t("Common.badRequest"),
});
