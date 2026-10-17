import type { CatalogTool } from "../../toolDefinition.js";
import { createWikiPageTool } from "./createWikiPage.js";
import { getWikiPageTool } from "./getWikiPage.js";
import { listWikiPagesTool } from "./listWikiPages.js";
import { searchWikiTool } from "./searchWiki.js";

export const wikiTools: readonly CatalogTool[] = [
  createWikiPageTool,
  getWikiPageTool,
  listWikiPagesTool,
  searchWikiTool,
];
