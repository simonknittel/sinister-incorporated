import {
  EventContainerKind,
  type EventContainer,
} from "../events/eventContainer.js";

/**
 * The routes of the wiki in the Next.js app, relative to its base URL. The
 * application and the client components of the app build their hrefs on
 * them.
 */
export const GLOBAL_WIKI_BASE_PATH = "/app/wiki";

/** Where the briefing of an event or of an event template is rendered */
export const getBriefingPath = (container: EventContainer) => {
  switch (container.kind) {
    case EventContainerKind.Event:
      return `/app/events/${container.id}/briefing`;

    case EventContainerKind.Template:
      return `/app/events/templates/${container.id}/briefing`;

    default:
      throw new Error(
        `Unknown event container kind: ${container.kind satisfies never}`,
      );
  }
};

/** The page of a fleet variant: it renders the root page of the variant wiki */
export const getVariantWikiRootPath = (variantId: string) =>
  `/app/fleet/variant/${variantId}`;

/** The route below which the subpages of the variant wiki live */
export const getVariantWikiBasePath = (variantId: string) =>
  `${getVariantWikiRootPath(variantId)}/wiki`;

/**
 * The base of the hrefs of the global wiki. The bases of the hrefs of the
 * wiki scopes have the shape of `WikiPageHrefBase` of the wiki editor: the
 * route prefix of the pages, the page that the scope serves at its home, and
 * the href of this page when it is not the route prefix.
 */
export const GLOBAL_WIKI_HREF_BASE = {
  basePath: GLOBAL_WIKI_BASE_PATH,
  rootPageId: null,
  rootHref: null,
};

/**
 * The briefing of an event or of an event template: its root page is the
 * home of the briefing
 */
export const createBriefingWikiHrefBase = (
  container: EventContainer,
  rootPageId: string | null,
) => ({
  basePath: getBriefingPath(container),
  rootPageId,
  rootHref: null,
});

/**
 * The subtree of the global wiki that a fleet variant embeds: its root page
 * serves on the page of the variant, its subpages below it
 */
export const createVariantWikiHrefBase = (
  variantId: string,
  rootPageId: string,
) => ({
  basePath: getVariantWikiBasePath(variantId),
  rootPageId,
  rootHref: getVariantWikiRootPath(variantId),
});
