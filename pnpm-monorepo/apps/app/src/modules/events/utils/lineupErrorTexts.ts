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

/**
 * The texts of the event errors that the lineup use cases also throw.
 * `EVENT_ERROR_TEXTS` uses the same texts.
 */
export const EVENT_NOT_FOUND_TEXT = "Event nicht gefunden";
export const EVENT_ENDED_TEXT = "Das Event ist bereits vorbei.";

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
