import type { CatalogTool } from "../../toolDefinition.js";
import { getChangelogEntryTool } from "./getChangelogEntry.js";
import { listChangelogEntriesTool } from "./listChangelogEntries.js";

export const changelogTools: readonly CatalogTool[] = [
  getChangelogEntryTool,
  listChangelogEntriesTool,
];
