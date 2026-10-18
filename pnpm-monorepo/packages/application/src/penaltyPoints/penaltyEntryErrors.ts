/**
 * The messages of the typed errors of the penalty entries that the app shows
 * with its own text
 */
export enum PenaltyEntryErrorMessage {
  /** A `NotFoundError`: usually an entry that a different user deleted */
  NotFound = "The penalty entry does not exist or is deleted",
  /** A `ConflictError`: usually a citizen that a different user deleted */
  CitizenDeleted = "The citizen is deleted",
}
