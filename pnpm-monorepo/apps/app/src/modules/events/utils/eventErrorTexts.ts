import type { ApplicationErrorTexts } from "@/modules/application";
import {
  EventErrorMessage,
  LineupErrorMessage,
} from "@sam-monorepo/application";
import {
  LINEUP_MAX_DEPTH,
  LINEUP_MAX_POSITIONS,
  LINEUP_MAX_POSITIONS_PER_LEVEL,
} from "@sam-monorepo/domain";
import { DESCRIPTION_TOO_LONG_TEXT } from "./discordEventDescription";

const EVENT_NOT_FOUND_TEXT = "Event nicht gefunden";
const EVENT_ENDED_TEXT = "Das Event ist bereits vorbei.";

/**
 * The texts of the event actions for the errors of the event use cases. The
 * other validation errors need a request that bypassed the forms: they get
 * the text of a bad request.
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
};

/** The texts of the lineup actions for the errors of the lineup use cases */
export const LINEUP_ERROR_TEXTS: ApplicationErrorTexts = {
  [EventErrorMessage.NotFound]: EVENT_NOT_FOUND_TEXT,
  [EventErrorMessage.EventEnded]: EVENT_ENDED_TEXT,
  [LineupErrorMessage.PositionNotFound]: "Posten nicht gefunden",
  [LineupErrorMessage.LineupChanged]:
    "Die Aufstellung wurde in der Zwischenzeit geändert.",
  [LineupErrorMessage.LineupTooDeep]: `Es sind maximal ${LINEUP_MAX_DEPTH} Ebenen möglich.`,
  [LineupErrorMessage.TooManyPositionsOnLevel]: `Auf dieser Ebene sind maximal ${LINEUP_MAX_POSITIONS_PER_LEVEL} Posten möglich.`,
  [LineupErrorMessage.TooManyPositions]: `Die Aufstellung hat maximal ${LINEUP_MAX_POSITIONS} Posten.`,
  [LineupErrorMessage.VariantNotFound]: "Schiff nicht gefunden",
  [LineupErrorMessage.CitizenNotFound]: "Citizen nicht gefunden",
  [LineupErrorMessage.CitizenNotParticipating]:
    "Der Citizen ist nicht für dieses Event angemeldet und hat kein Interesse für diesen Posten angemeldet.",
  [LineupErrorMessage.NotParticipating]:
    "Du bist nicht für dieses Event angemeldet.",
  [LineupErrorMessage.NotApplied]:
    "Du hast für diesen Posten kein Interesse angemeldet.",
};
