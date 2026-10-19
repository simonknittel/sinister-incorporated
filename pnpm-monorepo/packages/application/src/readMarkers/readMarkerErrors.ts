/**
 * The messages of the typed errors of the read markers. They are the members
 * of an enum, thus the app can show its own text for each of them.
 */
export enum ReadMarkerErrorMessage {
  /**
   * A `NotFoundError`: an item that the actor cannot see is the same as an
   * item that does not exist
   */
  ItemNotFound = "The item does not exist or is not visible",
}
