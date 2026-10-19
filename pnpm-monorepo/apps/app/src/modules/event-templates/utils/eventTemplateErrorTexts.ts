import type { ApplicationErrorTexts } from "@/modules/application";
import { EventTemplateErrorMessage } from "@sam-monorepo/application";

/**
 * The texts of the template actions for the errors of the template use
 * cases. `UnknownRole` needs a request that bypassed the form: it gets the
 * text of a bad request. The lineup texts spread this record, thus it must
 * not import the event texts (they import the lineup texts): the actions
 * that also get event errors merge both records.
 */
export const EVENT_TEMPLATE_ERROR_TEXTS: ApplicationErrorTexts = {
  [EventTemplateErrorMessage.NotFound]: "Vorlage nicht gefunden",
  [EventTemplateErrorMessage.Deleted]: "Die Vorlage ist gelöscht.",
  [EventTemplateErrorMessage.OwnerNotFound]: "Citizen nicht gefunden",
  [EventTemplateErrorMessage.ChannelMissing]: "Wähle einen Discord-Kanal aus.",
};
