/**
 * The values of the wiki settings that the forms of the app and the use
 * cases share.
 */

/**
 * Well-known places in the app that link to a configurable wiki page. Each
 * key gets a page picker in the wiki settings. Add a member here to make
 * another link configurable.
 */
export enum WikiPageLinkKey {
  Support = "support",
}

/** `WikiSetting.key` that stores the id of the page of the link */
export const getWikiPageLinkSettingKey = (key: WikiPageLinkKey) =>
  `pageLink:${key}`;

/**
 * The pages highlighted on the wiki landing page: four rows of its
 * three-column card grid
 */
export const MAXIMUM_WIKI_FEATURED_PAGES = 12;

/**
 * Matches a bare lowercase hostname like "example.com" (no scheme, port or
 * path): an entry of the iframe allowlist.
 */
export const WIKI_HOSTNAME_PATTERN =
  /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
