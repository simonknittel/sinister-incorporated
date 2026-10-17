/**
 * The longest name of an event. The forms of the app have a copy of this
 * limit (`modules/events/utils/eventConstraints.ts` of the app), because they
 * run in the browser and cannot import this package. Change both together.
 */
export const EVENT_NAME_MAX_LENGTH = 128;

/**
 * The cap of Discord for the description of a guild scheduled event. The app
 * publishes events to Discord, thus an event never has a longer description.
 * The app also refuses a smaller limit that leaves room for the sign-up note
 * of the Discord event (`findDescriptionProblem()` of the app).
 */
export const EVENT_DESCRIPTION_MAX_LENGTH = 1000;

/**
 * Arbitrary (untested) cap so a hostile client cannot make one request write
 * thousands of visibility rows. The forms of the app have a copy of it, like
 * `EVENT_NAME_MAX_LENGTH`.
 */
export const EVENT_MAX_VISIBILITY_ROLES = 50;

/**
 * Arbitrary (untested) cap of the citizens that one request adds as
 * participants or as managers, to prevent a denial of service
 */
export const EVENT_MAX_CITIZENS_PER_REQUEST = 50;

/** The longest comment of a participation and the longest removal reason */
export const EVENT_PARTICIPATION_TEXT_MAX_LENGTH = 500;
