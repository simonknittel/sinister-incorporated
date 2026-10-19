/**
 * Markers that `ts_headline` wraps around the matched words in the search
 * snippets. Control characters cannot occur in the extracted page text, so
 * splitting on them is unambiguous (unlike HTML tags, which could appear
 * literally).
 */
export const WIKI_SEARCH_MARK_START = "\u0001";
export const WIKI_SEARCH_MARK_END = "\u0002";
