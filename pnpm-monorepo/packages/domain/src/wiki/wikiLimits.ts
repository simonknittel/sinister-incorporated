/**
 * The limits of the wiki pages. The forms of the app, the use cases and the
 * MCP tools use the same values.
 */

export const WIKI_PAGE_TITLE_MAX_LENGTH = 128;

/**
 * The longest content of a page as Tiptap JSON. The collab server takes
 * request bodies up to 4 MiB.
 */
export const WIKI_PAGE_CONTENT_JSON_MAX_LENGTH = 2_000_000;
