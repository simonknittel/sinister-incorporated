/**
 * The limits of the lineup of an event or of an event template. The lineup
 * page, the forms of the app, the use cases and the MCP tools use the same
 * values.
 */

/**
 * The lineup has at most four levels. The page shows four levels, and the
 * position tree of the use cases loads four levels, thus a deeper position
 * would disappear from the page.
 */
export const LINEUP_MAX_DEPTH = 4;

/** The most positions with the same parent (or on the top level) */
export const LINEUP_MAX_POSITIONS_PER_LEVEL = 50;

/**
 * The most positions of one lineup. A new order writes one row for each
 * position in one transaction.
 */
export const LINEUP_MAX_POSITIONS = 500;
