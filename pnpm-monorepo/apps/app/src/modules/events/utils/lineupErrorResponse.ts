import type { ActionResponse } from "@/modules/actions/utils/createAction";
import { rejectConflict } from "@/modules/actions/utils/rejectConflict";
import { mapApplicationErrorToActionResponse } from "@/modules/application";
import {
  LineupErrorMessage,
  NotFoundError,
  ValidationError,
} from "@sam-monorepo/application";
import type { getTranslations } from "next-intl/server";

const LINEUP_ERROR_TEXTS: Readonly<Record<LineupErrorMessage, string>> = {
  [LineupErrorMessage.EventNotFound]: "Event nicht gefunden",
  [LineupErrorMessage.PositionNotFound]: "Posten nicht gefunden",
  [LineupErrorMessage.EventEnded]: "Das Event ist bereits vorbei.",
  [LineupErrorMessage.LineupChanged]:
    "Die Aufstellung wurde in der Zwischenzeit geändert.",
  [LineupErrorMessage.LineupTooDeep]: "Es sind maximal vier Ebenen möglich.",
  [LineupErrorMessage.VariantNotFound]: "Schiff nicht gefunden",
  [LineupErrorMessage.CitizenNotFound]: "Citizen nicht gefunden",
  [LineupErrorMessage.NotParticipating]:
    "Du bist nicht für dieses Event angemeldet.",
  [LineupErrorMessage.AlreadyApplied]:
    "Du hast für diesen Posten bereits Interesse angemeldet.",
  [LineupErrorMessage.NotApplied]:
    "Du hast für diesen Posten kein Interesse angemeldet.",
};

const isLineupErrorMessage = (message: string): message is LineupErrorMessage =>
  Object.values<string>(LineupErrorMessage).includes(message);

/** The text of the app for an error of a lineup use case */
export const toLineupErrorText = (error: Error) =>
  isLineupErrorMessage(error.message)
    ? LINEUP_ERROR_TEXTS[error.message]
    : error.message;

/**
 * Maps an error of a lineup use case to the response of a server action. A
 * missing event or position refreshes the page like a conflict, with its own
 * text. An input that does not agree with the data does not refresh. Use it
 * only in a server action (see `rejectConflict`).
 */
export const mapLineupErrorToActionResponse = (
  error: unknown,
  formData: FormData,
  t: Awaited<ReturnType<typeof getTranslations>>,
): ActionResponse => {
  if (error instanceof NotFoundError && isLineupErrorMessage(error.message))
    return rejectConflict(LINEUP_ERROR_TEXTS[error.message], formData);

  if (error instanceof ValidationError && isLineupErrorMessage(error.message))
    return {
      error: LINEUP_ERROR_TEXTS[error.message],
      requestPayload: formData,
    };

  return mapApplicationErrorToActionResponse(error, {
    formData,
    t,
    conflictMessage: toLineupErrorText,
  });
};
