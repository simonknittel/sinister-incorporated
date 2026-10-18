/**
 * The messages of the typed errors of the users that the app shows with its
 * own text
 */
export enum UserErrorMessage {
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
