/**
 * The limits of the Spynet search query. The search use case validates the
 * query with them, and the search fields of the app send only a query that
 * agrees with them.
 */
export const SPYNET_SEARCH_QUERY_MINIMUM_LENGTH = 2;

/** The longest stored name has 53 characters (an organization) */
export const SPYNET_SEARCH_QUERY_MAXIMUM_LENGTH = 60;

export enum SpynetSearchHitType {
  Citizen = "citizen",
  Organization = "organization",
}
