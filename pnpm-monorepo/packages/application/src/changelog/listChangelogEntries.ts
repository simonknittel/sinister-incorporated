import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext, ChangelogEntrySource } from "../context.js";
import { ValidationError } from "../errors.js";
import { isChangelogEntryReadable } from "./isChangelogEntryReadable.js";
import { CHANGELOG_QUARTER_SLUG_PATTERN, getQuarterOfDate } from "./quarter.js";

/** The page size when the caller does not give one */
const DEFAULT_CHANGELOG_LIST_LIMIT = 25;

/** One call never returns more entries than this */
const MAXIMUM_CHANGELOG_LIST_LIMIT = 100;

/** The cursor is the key of an entry. The keys are short slugs. */
export const MAXIMUM_CHANGELOG_KEY_LENGTH = 200;

export const listChangelogEntriesInputSchema = z.object({
  quarter: z
    .string()
    .regex(CHANGELOG_QUARTER_SLUG_PATTERN)
    .optional()
    .describe(
      "Only the entries of this quarter, for example 2026-q4. Without it, the list starts with the newest entry.",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAXIMUM_CHANGELOG_LIST_LIMIT)
    .default(DEFAULT_CHANGELOG_LIST_LIMIT),
  cursor: z
    .string()
    .min(1)
    .max(MAXIMUM_CHANGELOG_KEY_LENGTH)
    .optional()
    .describe("The next_cursor of the previous page."),
});

export type ListChangelogEntriesInput = z.output<
  typeof listChangelogEntriesInputSchema
>;

export interface ChangelogEntrySummary {
  readonly key: string;
  /** `YYYY-MM-DD` */
  readonly date: string;
  readonly title: string;
  readonly tags: string[];
  /** Whether the app shows the entry as unseen until the user saw it */
  readonly is_tracked: boolean;
}

export interface ListChangelogEntriesOutput {
  readonly entries: ChangelogEntrySummary[];
  readonly next_cursor: string | null;
}

/** The newest first; the entries of one day in the order of their keys */
const compareChangelogEntries = (
  first: ChangelogEntrySource,
  second: ChangelogEntrySource,
) =>
  second.date.localeCompare(first.date, "en") ||
  first.key.localeCompare(second.key, "en");

/**
 * The changelog entries that the actor can read, one page. Without the
 * permission of an entry with `requiresAuth`, the entry is not in the list.
 * Reading does not mark the entries as seen.
 */
export const listChangelogEntries = async (
  context: ApplicationContext,
  actor: Actor,
  input: ListChangelogEntriesInput,
): Promise<ListChangelogEntriesOutput> => {
  const entries = (await context.changelog.list())
    .filter(
      (entry) =>
        isChangelogEntryReadable(actor, entry) &&
        (!input.quarter || getQuarterOfDate(entry.date).slug === input.quarter),
    )
    .toSorted(compareChangelogEntries);

  let start = 0;
  if (input.cursor) {
    const cursorIndex = entries.findIndex(
      (entry) => entry.key === input.cursor,
    );
    if (cursorIndex < 0) throw new ValidationError("The cursor is not valid");

    start = cursorIndex + 1;
  }

  const page = entries.slice(start, start + input.limit);
  const lastEntry = page.at(-1);
  const hasMore = start + input.limit < entries.length;

  return {
    entries: page.map((entry) => ({
      key: entry.key,
      date: entry.date,
      title: entry.title,
      tags: [...entry.tags],
      is_tracked: entry.isTracked,
    })),
    next_cursor: hasMore && lastEntry ? lastEntry.key : null,
  };
};
