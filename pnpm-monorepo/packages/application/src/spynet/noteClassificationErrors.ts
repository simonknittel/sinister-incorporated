/**
 * The messages of the errors that the use cases of the note types and the
 * classification levels throw. They are the members of an enum, thus an app
 * can map them to its own texts.
 */
export enum NoteClassificationErrorMessage {
  /** A `NotFoundError` */
  NoteTypeNotFound = "The note type does not exist",
  /** A `NotFoundError` */
  ClassificationLevelNotFound = "The classification level does not exist",
}
