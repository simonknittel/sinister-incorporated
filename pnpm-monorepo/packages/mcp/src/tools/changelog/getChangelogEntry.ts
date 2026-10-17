import {
  getChangelogEntry,
  getChangelogEntryInputSchema,
} from "@sam-monorepo/application";
import * as z from "zod";
import {
  defineTool,
  READ_ONLY_TOOL_ANNOTATIONS,
} from "../../toolDefinition.js";
import { ToolGroup } from "../../toolGroup.js";

export const getChangelogEntryTool = defineTool({
  name: "get_changelog_entry",
  group: ToolGroup.Changelog,
  title: "Get a changelog entry",
  description:
    "Gives one entry of the changelog of S.A.M. with its text as Markdown. The key comes from list_changelog_entries.",
  annotations: READ_ONLY_TOOL_ANNOTATIONS,
  inputSchema: getChangelogEntryInputSchema,
  outputSchema: z.strictObject({
    key: z.string(),
    date: z.iso.date(),
    title: z.string(),
    tags: z.array(z.string()),
    markdown: z.string(),
  }),
  isVisible: () => true,
  handler: (context, actor, input) => getChangelogEntry(context, actor, input),
});
