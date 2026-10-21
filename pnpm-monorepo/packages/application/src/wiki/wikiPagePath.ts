import {
  getBriefingPath,
  getVariantWikiBasePath,
  getVariantWikiRootPath,
  GLOBAL_WIKI_BASE_PATH,
  type EventContainer,
} from "@sam-monorepo/domain";
import type { WikiPageHrefBase } from "@sam-monorepo/wiki-editor/helpers";

export const GLOBAL_WIKI_HREF_BASE: WikiPageHrefBase = {
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
): WikiPageHrefBase => ({
  basePath: getVariantWikiBasePath(variantId),
  rootPageId,
  rootHref: getVariantWikiRootPath(variantId),
});
