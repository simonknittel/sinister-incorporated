import type { ApplicationErrorTexts } from "@/modules/application";
import { EventErrorMessage } from "@sam-monorepo/application";
import { DESCRIPTION_TOO_LONG_TEXT } from "./discordEventDescription";
import { EVENT_ENDED_TEXT, EVENT_NOT_FOUND_TEXT } from "./lineupErrorTexts";

/**
 * The texts of the event actions for the errors of the event use cases. The
 * other validation errors need a request that bypassed the forms: they get
 * the text of a bad request. The template actions merge this record with
 * `EVENT_TEMPLATE_ERROR_TEXTS`.
 */
export const EVENT_ERROR_TEXTS: ApplicationErrorTexts = {
  [EventErrorMessage.NotFound]: EVENT_NOT_FOUND_TEXT,
  [EventErrorMessage.EventEnded]: EVENT_ENDED_TEXT,
  // The forms show only the lineup switch for a Discord event
  [EventErrorMessage.DiscordEvent]: EVENT_NOT_FOUND_TEXT,
  // Not reached: the actions carry the change over to Discord themselves
  [EventErrorMessage.PublishedOnDiscord]:
    "Das Event ist auf Discord veröffentlicht.",
  [EventErrorMessage.ParticipationClosed]: "Die Anmeldung ist geschlossen.",
  [EventErrorMessage.AlreadySignedUp]: "Du bist bereits angemeldet.",
  [EventErrorMessage.NotSignedUp]: "Du bist nicht angemeldet.",
  [EventErrorMessage.CitizenNotSignedUp]: "Der Citizen ist nicht angemeldet.",
  [EventErrorMessage.CitizenNotManager]:
    "Der Citizen ist kein Manager des Events.",
  [EventErrorMessage.EndBeforeStart]: "Das Ende muss nach dem Start liegen.",
  [EventErrorMessage.DescriptionTooLong]: DESCRIPTION_TOO_LONG_TEXT,
  [EventErrorMessage.NoVisibilityRole]: "Wähle mindestens eine Rolle aus.",
  [EventErrorMessage.InvalidCoverImage]: "Ungültiges Titelbild",
  [EventErrorMessage.NoCitizenSelected]:
    "Bitte wähle mindestens einen Citizen aus.",
  [EventErrorMessage.CitizenCannotSeeEvent]:
    "Mindestens ein Citizen kann das Event nicht sehen.",
  [EventErrorMessage.AlreadyPublishedOnDiscord]:
    "Das Event ist bereits auf Discord veröffentlicht.",
  [EventErrorMessage.DiscordChannelUnavailable]:
    "Der ausgewählte Kanal steht nicht (mehr) zur Verfügung. Lade die Seite neu.",
};
