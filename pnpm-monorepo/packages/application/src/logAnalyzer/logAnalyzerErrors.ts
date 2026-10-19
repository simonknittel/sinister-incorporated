/**
 * The messages of the typed errors of the Log Analyzer. They are the members
 * of an enum, thus each app can show its own text for each of them.
 */
export enum LogAnalyzerErrorMessage {
  /**
   * A `ValidationError`: an entry does not match the pattern of its type, or
   * it carries a time that does not agree with its type
   */
  InvalidEntries = "An entry does not match the pattern of its type",
  /** A `ForbiddenError`: the kill switch of the sharing is on */
  SharingDisabled = "Log analyzer sharing is disabled",
}
