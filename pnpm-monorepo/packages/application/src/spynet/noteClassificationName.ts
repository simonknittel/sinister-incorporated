import * as z from "zod";

/** The longest name of a note type or a classification level */
export const MAXIMUM_NOTE_CLASSIFICATION_NAME_LENGTH = 255;

export const noteClassificationNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAXIMUM_NOTE_CLASSIFICATION_NAME_LENGTH);
