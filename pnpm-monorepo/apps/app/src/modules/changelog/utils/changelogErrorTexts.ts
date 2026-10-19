import type { ApplicationErrorTexts } from "@/modules/application";
import { ChangelogErrorMessage } from "@sam-monorepo/application";

/** The texts of the changelog actions for the errors of the changelog use cases */
export const CHANGELOG_ERROR_TEXTS = {
  [ChangelogErrorMessage.NotAvailable]: "Das Changelog ist nicht verfügbar.",
} satisfies ApplicationErrorTexts;
