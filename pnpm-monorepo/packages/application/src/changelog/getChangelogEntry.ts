import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { isChangelogEntryReadable } from "./isChangelogEntryReadable.js";
import { MAXIMUM_CHANGELOG_KEY_LENGTH } from "./listChangelogEntries.js";

export const getChangelogEntryInputSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(MAXIMUM_CHANGELOG_KEY_LENGTH)
    .describe("The key of the entry, for example from list_changelog_entries."),
});

export type GetChangelogEntryInput = z.output<
  typeof getChangelogEntryInputSchema
>;

export interface GetChangelogEntryOutput {
  readonly key: string;
  /** `YYYY-MM-DD` */
  readonly date: string;
  readonly title: string;
  readonly tags: string[];
  /** The body of the entry as Markdown, with absolute URLs */
  readonly markdown: string;
}

/**
 * One changelog entry with its body. Throws a `NotFoundError` when the entry
 * does not exist or the actor does not have the permission of its
 * `requiresAuth`. Reading does not mark the entry as seen.
 */
export const getChangelogEntry = async (
  context: ApplicationContext,
  actor: Actor,
  input: GetChangelogEntryInput,
): Promise<GetChangelogEntryOutput> => {
  const entry = (await context.changelog.list()).find(
    (entry) => entry.key === input.key,
  );
  if (!entry || !isChangelogEntryReadable(actor, entry))
    throw new NotFoundError(
      "The changelog entry does not exist or the user cannot read it",
    );

  return {
    key: entry.key,
    date: entry.date,
    title: entry.title,
    tags: [...entry.tags],
    markdown: entry.markdown,
  };
};
