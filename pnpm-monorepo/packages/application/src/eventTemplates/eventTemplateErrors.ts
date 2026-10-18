/**
 * The messages of the typed errors of the event templates. They are the
 * members of an enum, thus the app can show its own text for each of them.
 */
export enum EventTemplateErrorMessage {
  /**
   * A `NotFoundError`: the template does not exist, or the actor cannot see
   * it
   */
  NotFound = "The event template does not exist",
  /** A `ConflictError` */
  Deleted = "The event template is deleted",
  /** A `ValidationError`: the new owner does not exist */
  OwnerNotFound = "The citizen does not exist",
  /** A `ValidationError` */
  UnknownRole = "At least one role does not exist",
  /** A `ValidationError` */
  ChannelMissing = "The Discord target CHANNEL needs a channel",
}
