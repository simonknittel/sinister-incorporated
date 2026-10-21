import * as z from "zod";

/**
 * Arbitrary cap of the name of a note type or a classification level. The
 * name field of the settings form shows one short line, thus only a crafted
 * request gets near the cap.
 */
const MAXIMUM_NOTE_CLASSIFICATION_NAME_LENGTH = 255;

export const noteClassificationNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAXIMUM_NOTE_CLASSIFICATION_NAME_LENGTH);
