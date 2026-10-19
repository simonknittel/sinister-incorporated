/**
 * The messages of the typed errors of the changelog. They are the members of
 * an enum, thus the app can show its own text for each of them.
 */
export enum ChangelogErrorMessage {
  /** A `ConflictError`: the host has no changelog entries */
  NotAvailable = "The changelog is not available",
}
