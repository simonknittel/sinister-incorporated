import type { ActionResponse } from "@/modules/actions/utils/createAction";
import { rejectConflict } from "@/modules/actions/utils/rejectConflict";
import { mapApplicationErrorToActionResponse } from "@/modules/application";
import {
  EventConflict,
  EventConflictError,
  EventValidationError,
  EventValidationProblem,
  NotFoundError,
  type ConflictError,
} from "@sam-monorepo/application";
import type { getTranslations } from "next-intl/server";

const EVENT_NOT_FOUND_TEXT = "Event nicht gefunden";

const CONFLICT_TEXTS: Readonly<Record<EventConflict, string>> = {
  [EventConflict.EventEnded]: "Das Event ist bereits vorbei.",
  // The forms show only the lineup switch for a Discord event
  [EventConflict.DiscordEvent]: EVENT_NOT_FOUND_TEXT,
  // Not reached: the actions carry the change over to Discord themselves
  [EventConflict.PublishedOnDiscord]:
    "Das Event ist auf Discord veröffentlicht.",
  [EventConflict.ParticipationClosed]: "Die Anmeldung ist geschlossen.",
  [EventConflict.AlreadySignedUp]: "Du bist bereits angemeldet.",
  [EventConflict.NotSignedUp]: "Du bist nicht angemeldet.",
  [EventConflict.CitizenNotSignedUp]: "Der Citizen ist nicht angemeldet.",
  [EventConflict.CitizenNotManager]: "Der Citizen ist kein Manager des Events.",
};

/**
 * The texts of the problems that the forms can cause. The other problems
 * need a request that bypassed the forms: they get the text of a bad request.
 */
const VALIDATION_TEXTS: Readonly<
  Partial<Record<EventValidationProblem, string>>
> = {
  [EventValidationProblem.EndBeforeStart]:
    "Das Ende muss nach dem Start liegen.",
  [EventValidationProblem.NoVisibilityRole]: "Wähle mindestens eine Rolle aus.",
  [EventValidationProblem.InvalidCoverImage]: "Ungültiges Titelbild",
  [EventValidationProblem.NoCitizenSelected]:
    "Bitte wähle mindestens einen Citizen aus.",
  [EventValidationProblem.CitizenCannotSeeEvent]:
    "Mindestens ein Citizen kann das Event nicht sehen.",
};

const toConflictText = (error: ConflictError) =>
  error instanceof EventConflictError
    ? CONFLICT_TEXTS[error.conflict]
    : error.message;

/**
 * Maps an error of an event use case to the response of an event action,
 * with the texts that the actions showed before the use cases. A missing
 * event refreshes the page like a conflict. Use it only in a server action
 * (see `rejectConflict`).
 */
export const mapEventErrorToActionResponse = (
  error: unknown,
  formData: FormData,
  t: Awaited<ReturnType<typeof getTranslations>>,
): ActionResponse => {
  if (error instanceof NotFoundError)
    return rejectConflict(EVENT_NOT_FOUND_TEXT, formData);

  if (error instanceof EventValidationError) {
    const text = VALIDATION_TEXTS[error.problem];
    if (text) return { error: text, requestPayload: formData };
  }

  return mapApplicationErrorToActionResponse(error, {
    formData,
    t,
    conflictMessage: toConflictText,
  });
};
