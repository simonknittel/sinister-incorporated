import type { ApplicationErrorTexts } from "@/modules/application";
import { CareerErrorMessage } from "@sam-monorepo/application";
import { SLUG_MAX_LENGTH } from "@sam-monorepo/domain";

/**
 * The texts of the career actions for the errors of the career use cases.
 * The messages without a text get the common text of their error class.
 */
export const CAREER_ERROR_TEXTS = {
  [CareerErrorMessage.SlugFormat]: `Der Slug darf nur Kleinbuchstaben, Ziffern und einzelne Bindestriche enthalten und höchstens ${SLUG_MAX_LENGTH} Zeichen lang sein.`,
  [CareerErrorMessage.SlugReserved]:
    "Dieser Slug ist reserviert und kann nicht verwendet werden.",
  [CareerErrorMessage.SlugTaken]:
    "Dieser Slug wird bereits von einem anderen Karrierebaum verwendet.",
  [CareerErrorMessage.DuplicateSourceNotFound]:
    "Der zu duplizierende Karrierebaum wurde nicht gefunden.",
  [CareerErrorMessage.StaleOrder]:
    "Die Reihenfolge war veraltet. Die Liste ist jetzt aktuell, bitte versuche es erneut.",
} satisfies ApplicationErrorTexts;
