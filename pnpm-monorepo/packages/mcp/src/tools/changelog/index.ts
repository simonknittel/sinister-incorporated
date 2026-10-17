import type { CatalogTool } from "../../toolDefinition.js";
import { listChangelogEntriesTool } from "./listChangelogEntries.js";

export const changelogTools: readonly CatalogTool[] = [
  listChangelogEntriesTool,
];
