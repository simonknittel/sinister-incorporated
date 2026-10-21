/**
 * The messages of the errors that the organization use cases throw for a
 * rule of the organizations. They are the members of an enum, thus an app
 * can map them to its own texts.
 */
export enum OrganizationErrorMessage {
  /** A `ValidationError` */
  SpectrumIdTaken = "An organization with this Spectrum ID exists already",
  /**
   * A `ValidationError`, not a `NotFoundError`: organizations cannot be
   * deleted, thus an unknown id is an input error, and the page needs no
   * refresh
   */
  OrganizationNotFound = "The organization does not exist",
  /** A `NotFoundError` */
  MembershipEntryNotFound = "The membership entry does not exist, or its citizen is deleted",
  /** A `NotFoundError` */
  MembershipNotFound = "The membership does not exist, or its citizen is deleted",
  /** A `ConflictError` */
  AlreadyConfirmed = "Somebody already decided about the membership entry",
}
