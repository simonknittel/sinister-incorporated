/**
 * The messages of the typed errors of the lineup. They are the members of an
 * enum, thus the app can show its own text for each of them.
 */
export enum LineupErrorMessage {
  EventNotFound = "The event does not exist",
  PositionNotFound = "The position does not exist",
  EventEnded = "The event has ended, thus its lineup cannot change",
  LineupChanged = "A position of the order is not in the lineup",
  LineupTooDeep = "The lineup has at most four levels",
  VariantNotFound = "A ship variant does not exist",
  CitizenNotFound = "The citizen does not exist",
  NotParticipating = "The user does not participate in the event",
  AlreadyApplied = "The user already applied for the position",
  NotApplied = "The user did not apply for the position",
}
