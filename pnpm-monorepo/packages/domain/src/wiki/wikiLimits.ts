/**
 * The limits of the wiki pages, their tags and their reports. The forms of
 * the app, the use cases and the MCP tools use the same values.
 */

export const WIKI_PAGE_TITLE_MAX_LENGTH = 128;

/**
 * The longest content of a page as Tiptap JSON. The collab server takes
 * request bodies up to 4 MiB.
 */
export const WIKI_PAGE_CONTENT_JSON_MAX_LENGTH = 2_000_000;

/** The most tags of one page */
export const MAXIMUM_WIKI_PAGE_TAGS = 20;

export const WIKI_TAG_NAME_MAXIMUM_LENGTH = 50;

/** The longest text of a report and of its resolution comment */
export const WIKI_REPORT_TEXT_MAXIMUM_LENGTH = 2_048;
