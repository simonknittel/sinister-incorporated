import {
  listChangelogEntries,
  listChangelogEntriesInputSchema,
} from "@sam-monorepo/application";
import * as z from "zod";
import {
  defineTool,
  READ_ONLY_TOOL_ANNOTATIONS,
} from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";

export const listChangelogEntriesTool = defineTool({
  name: "list_changelog_entries",
  group: ToolGroup.Changelog,
  title: "List the changelog entries",
  description:
    "Gives the entries of the changelog of S.A.M. (the release notes), the newest first: the key, the date, the title and the tags, without the text. Give a quarter (for example 2026-q4) for the entries of this quarter. Give a key to get_changelog_entry for the text.",
  annotations: READ_ONLY_TOOL_ANNOTATIONS,
  inputSchema: listChangelogEntriesInputSchema,
  outputSchema: z.strictObject({
    entries: z.array(
      z.strictObject({
        key: z.string(),
        date: z.iso.date(),
        title: z.string(),
        tags: z.array(z.string()),
        /** Whether the app shows the entry as unseen until the user saw it */
        is_tracked: z.boolean(),
      }),
    ),
    next_cursor: z.string().nullable(),
  }),
  isVisible: () => true,
  handler: (context, actor, input) =>
    listChangelogEntries(context, actor, input),
});
