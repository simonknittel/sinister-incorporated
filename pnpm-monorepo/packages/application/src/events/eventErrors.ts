import { ConflictError, ValidationError } from "../errors.js";

/** The states of an event or of a participation that refuse a write */
export enum EventConflict {
  /** The event ended: nothing of it can change */
  EventEnded = "event_ended",
  /** Only the lineup of an event that comes from Discord can change */
  DiscordEvent = "discord_event",
  /**
   * The change must also go to the Discord event, and the caller cannot
   * reach Discord
   */
  PublishedOnDiscord = "published_on_discord",
  /** The event ended: the own participation cannot change */
  ParticipationClosed = "participation_closed",
  AlreadySignedUp = "already_signed_up",
  NotSignedUp = "not_signed_up",
  CitizenNotSignedUp = "citizen_not_signed_up",
  CitizenNotManager = "citizen_not_manager",
}

const CONFLICT_MESSAGES: Readonly<Record<EventConflict, string>> = {
  [EventConflict.EventEnded]: "The event has ended",
  [EventConflict.DiscordEvent]:
    "The event comes from Discord: only lineup_enabled can change",
  [EventConflict.PublishedOnDiscord]:
    "The event is published on Discord. Do this change in SAM, which also changes the Discord event.",
  [EventConflict.ParticipationClosed]: "The sign-up is closed",
  [EventConflict.AlreadySignedUp]: "The user is already signed up",
  [EventConflict.NotSignedUp]: "The user is not signed up",
  [EventConflict.CitizenNotSignedUp]: "The citizen is not signed up",
  [EventConflict.CitizenNotManager]:
    "The citizen is not a manager of the event",
};

/** A conflict of an event write. Each app can show its own text for it. */
export class EventConflictError extends ConflictError {
  readonly conflict: EventConflict;

  constructor(conflict: EventConflict) {
    super(CONFLICT_MESSAGES[conflict]);
    this.conflict = conflict;
  }
}

/** The input of an event write that does not agree with the data */
export enum EventValidationProblem {
  EndBeforeStart = "end_before_start",
  /** A restricted event needs at least one role */
  NoVisibilityRole = "no_visibility_role",
  UnknownVisibilityRole = "unknown_visibility_role",
  /** The cover image is not an image upload of the actor */
  InvalidCoverImage = "invalid_cover_image",
  NoCitizenSelected = "no_citizen_selected",
  /**
   * A citizen to add cannot see the event, cannot log in or cannot get its
   * notifications
   */
  CitizenCannotSeeEvent = "citizen_cannot_see_event",
  UnknownCitizen = "unknown_citizen",
}

const VALIDATION_MESSAGES: Readonly<Record<EventValidationProblem, string>> = {
  [EventValidationProblem.EndBeforeStart]: "The end must be after the start",
  [EventValidationProblem.NoVisibilityRole]:
    "A restricted event needs at least one visibility role",
  [EventValidationProblem.UnknownVisibilityRole]:
    "At least one visibility role does not exist",
  [EventValidationProblem.InvalidCoverImage]:
    "The cover image is not an image upload of the user",
  [EventValidationProblem.NoCitizenSelected]: "Give at least one citizen",
  [EventValidationProblem.CitizenCannotSeeEvent]:
    "At least one citizen cannot see the event, cannot log in or gets no event notifications",
  [EventValidationProblem.UnknownCitizen]:
    "At least one citizen does not exist",
};

/**
 * A problem of the input of an event write. Each app can show its own text
 * for it.
 */
export class EventValidationError extends ValidationError {
  readonly problem: EventValidationProblem;

  constructor(problem: EventValidationProblem) {
    super(VALIDATION_MESSAGES[problem]);
    this.problem = problem;
  }
}
