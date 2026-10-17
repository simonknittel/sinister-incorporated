import type { WikiPageHrefBase } from "@sam-monorepo/wiki-editor/helpers";

/**
 * The routes of the wiki in the Next.js app, relative to its base URL. The
 * app has the same routes in `modules/wiki/utils/wikiPageHref.ts` and
 * `modules/events/utils/eventContainer.ts`: client components use them,
 * thus they cannot import this package.
 */
export const GLOBAL_WIKI_HREF_BASE: WikiPageHrefBase = {
  basePath: "/app/wiki",
  rootPageId: null,
  rootHref: null,
};

/** The briefing of an event: its root page is the home of the briefing */
export const createEventWikiHrefBase = (
  eventId: string,
  rootPageId: string | null,
): WikiPageHrefBase => ({
  basePath: `/app/events/${eventId}/briefing`,
  rootPageId,
  rootHref: null,
});
