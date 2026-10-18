/**
 * The limits of the events. The forms of the app, the use cases and the MCP
 * tools use the same values.
 */

export const EVENT_NAME_MAX_LENGTH = 128;

/**
 * Arbitrary (untested) cap so a hostile client cannot make one request write
 * thousands of visibility rows
 */
export const EVENT_MAX_VISIBILITY_ROLES = 50;

/**
 * Arbitrary (untested) cap of the citizens that one request adds as
 * participants or as managers, to prevent a denial of service
 */
export const EVENT_MAX_CITIZENS_PER_REQUEST = 50;

/** The longest comment of a participation and the longest removal reason */
export const EVENT_PARTICIPATION_TEXT_MAX_LENGTH = 500;
