import { EventContainerKind, type EventContainer } from "@sam-monorepo/domain";
import type { WikiPageHrefBase } from "@sam-monorepo/wiki-editor/helpers";

/**
 * The routes of the wiki in the Next.js app, relative to its base URL. The
 * app has the same routes in `modules/wiki/utils/wikiPageHref.ts` (the
 * global wiki and the variant embeds) and in
 * `modules/events/utils/eventContainer.ts` (the briefings): client
 * components use them, thus they cannot import this package.
 */
export const GLOBAL_WIKI_HREF_BASE: WikiPageHrefBase = {
  basePath: "/app/wiki",
  rootPageId: null,
  rootHref: null,
};

const getBriefingPath = (container: EventContainer) => {
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

/**
 * The briefing of an event or of an event template: its root page is the
 * home of the briefing
 */
export const createBriefingWikiHrefBase = (
  container: EventContainer,
  rootPageId: string | null,
): WikiPageHrefBase => ({
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
): WikiPageHrefBase => {
  const variantPath = `/app/fleet/variant/${variantId}`;

  return {
    basePath: `${variantPath}/wiki`,
    rootPageId,
    rootHref: variantPath,
  };
};
