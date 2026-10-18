/**
 * The messages of the typed errors of the auth use cases. They are the
 * members of an enum, thus each app can show its own text for each of them.
 */
export enum AuthErrorMessage {
  /**
   * A `ValidationError`: the session ignores the cookie for the own account
   * of the admin, thus an assume would have no effect
   */
  OwnAccount = "You cannot assume your own account.",
  /** A `NotFoundError`: the user does not exist or has no login account */
  UserNotAssumable = "The user does not exist or has no login account",
  /**
   * A `ValidationError`: deleting the session behind the request would sign
   * the user out in the middle of the page
   */
  CurrentSession = "The current session cannot be deleted",
  /** A `NotFoundError`: the session does not exist or is not a session of the user */
  SessionNotFound = "The session does not exist",
}
