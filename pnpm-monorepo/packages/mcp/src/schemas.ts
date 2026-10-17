import * as z from "zod";

/**
 * The id of a row in the database. Older tables make their ids with
 * `cuid()`, newer tables with `cuid(2)`. Both formats contain only lowercase
 * letters and digits, thus one pattern accepts both. A cuid2 has a maximum
 * length of 32 characters, a cuid has 25.
 */
export const cuidSchema = z.string().regex(/^[a-z0-9]{1,32}$/);

/** The page size of a list tool when the client does not give one */
export const DEFAULT_LIMIT = 25;

/** A list tool never returns more items than this in one call */
export const MAXIMUM_LIMIT = 100;

export const limitSchema = z
  .number()
  .int()
  .min(1)
  .max(MAXIMUM_LIMIT)
  .default(DEFAULT_LIMIT);

/** A cursor is an opaque value that a list tool gives in `next_cursor` */
const MAXIMUM_CURSOR_LENGTH = 256;

export const cursorSchema = z.string().min(1).max(MAXIMUM_CURSOR_LENGTH);

/** An instant with an offset or `Z`, for example `2026-10-17T20:00:00+02:00` */
export const dateTimeInputSchema = z.iso.datetime({ offset: true });

/** An instant in UTC, for example `2026-10-17T18:00:00.000Z` */
export const dateTimeOutputSchema = z.iso.datetime();

export const toIsoString = (date: Date) => date.toISOString();

export const citizenReferenceSchema = z.strictObject({
  id: z.string(),
  /** Display text. It can change and it does not identify the citizen. */
  handle: z.string().nullable(),
});

export const eventReferenceSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
});

export const taskReferenceSchema = z.strictObject({
  id: z.string(),
  title: z.string(),
});
