/**
 * The messages of the typed errors of the apps. They are the members of an
 * enum, thus the app can show its own text for each of them.
 */
export enum AppErrorMessage {
  /**
   * A `NotFoundError`: the key names no app, or the app is not visible to the
   * actor
   */
  AppNotFound = "The app does not exist or is not visible",
}
