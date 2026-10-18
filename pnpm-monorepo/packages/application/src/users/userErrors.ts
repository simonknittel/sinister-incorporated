/**
 * The messages of the typed errors of the user use cases. They are the
 * members of an enum, thus an app can map them to its own texts.
 */
export enum UserErrorMessage {
  /** A `NotFoundError` */
  NotFound = "The user does not exist",
  /** A `ValidationError` */
  CannotBanSelf = "A user cannot ban themselves",
  /**
   * A `ValidationError`: admins bypass the permission checks and could
   * unban themselves anyway
   */
  CannotBanAdmin = "An admin cannot be banned",
  /** A `ConflictError`: usually a user that a different user banned before */
  AlreadyBanned = "The user is already banned",
  /** A `ConflictError`: usually a user that a different user unbanned before */
  NotBanned = "The user is not banned",
}
