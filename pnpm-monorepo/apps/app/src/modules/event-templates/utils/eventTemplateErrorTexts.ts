import type { ApplicationErrorTexts } from "@/modules/application";
import { EventTemplateErrorMessage } from "@sam-monorepo/application";

/** The texts of the template actions for the errors of the template use cases */
export const EVENT_TEMPLATE_ERROR_TEXTS: ApplicationErrorTexts = {
  [EventTemplateErrorMessage.NotFound]: "Vorlage nicht gefunden",
  [EventTemplateErrorMessage.Deleted]: "Die Vorlage ist gelöscht.",
};
