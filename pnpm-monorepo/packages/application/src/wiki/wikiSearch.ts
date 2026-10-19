import { EventContainerKind } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";
import { buildVisibleWikiBreadcrumb } from "./wikiBreadcrumb.js";
import {
  findReadableWikiScope,
  type WikiScope,
  type WikiScopeTarget,
} from "./wikiScope.js";
import { WikiScopeKind } from "./wikiScopeKind.js";
import {
  buildContainerWikiSearchFilters,
  buildVariantWikiSearchFilters,
  GLOBAL_WIKI_SEARCH_FILTERS,
  queryWikiSearch,
  WikiSearchContainerColumn,
  type WikiSearchScopeFilters,
} from "./wikiSearchQuery.js";

/** The search returns at most this number of pages */
const MAXIMUM_WIKI_SEARCH_PAGES = 20;

export interface WikiSearchPageResult {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly iconId: string | null;
  /** Titles of the visible, not-deleted ancestors, root first */
  readonly breadcrumb: string[];
  /**
   * Plain-text snippet with the matches wrapped in `WIKI_SEARCH_MARK_START`
   * and `WIKI_SEARCH_MARK_END`
   */
  readonly snippet: string;
  /** Names of the page's tags matching the query */
  readonly matchedTags: string[];
}

export interface WikiSearchTagResult {
  readonly id: string;
  readonly name: string;
}

export interface WikiSearchResults {
  readonly tags: WikiSearchTagResult[];
  readonly pages: WikiSearchPageResult[];
}

const EMPTY_RESULTS: WikiSearchResults = { tags: [], pages: [] };

const toContainerColumn = (kind: EventContainerKind) => {
  switch (kind) {
    case EventContainerKind.Event:
      return WikiSearchContainerColumn.EventId;

    case EventContainerKind.Template:
      return WikiSearchContainerColumn.TemplateId;

    default:
      throw new Error(`Unknown event container kind: ${kind satisfies never}`);
  }
};

const toSearchFilters = (scope: WikiScope): WikiSearchScopeFilters => {
  switch (scope.kind) {
    case WikiScopeKind.Wiki:
      return GLOBAL_WIKI_SEARCH_FILTERS;

    case WikiScopeKind.Briefing:
      return buildContainerWikiSearchFilters(
        toContainerColumn(scope.container.kind),
        scope.container.id,
      );

    case WikiScopeKind.Variant:
      return buildVariantWikiSearchFilters([...scope.subtreePageIds]);

    default:
      throw new Error(`Unknown wiki scope: ${scope satisfies never}`);
  }
};

/**
 * Full-text search over the pages that the actor can read and over the tags
 * of one scope: the global wiki, the briefing of an event or of an event
 * template, or the subtree that a fleet variant embeds (see
 * `queryWikiSearch()`). A scope that the actor cannot hold gives no results.
 */
export const findWikiSearchResults = (
  context: ApplicationContext,
  actor: Actor,
  {
    query,
    target,
  }: { readonly query: string; readonly target: WikiScopeTarget },
): Promise<WikiSearchResults> =>
  withSpan(context, "findWikiSearchResults", async () => {
    /**
     * Without the briefing gate the page results would come back empty
     * anyway (parent-read gating), but the unfiltered tag branch would still
     * hand tag names to `event;read` holders the layout 404s.
     */
    const scope = await findReadableWikiScope(context, actor, target);
    if (!scope) return EMPTY_RESULTS;

    const readablePageIds = [...scope.permissions]
      .filter(([, permissions]) => permissions.canRead)
      .map(([pageId]) => pageId);

    const result = await queryWikiSearch(context.prisma, {
      query,
      readablePageIds,
      filters: toSearchFilters(scope),
      pageLimit: MAXIMUM_WIKI_SEARCH_PAGES,
    });

    const pages = result.pages.flatMap((match) => {
      const page = scope.pagesById.get(match.id);
      if (!page) return [];

      return [
        {
          id: page.id,
          title: page.title,
          slug: page.slug,
          iconId: page.iconId,
          breadcrumb: buildVisibleWikiBreadcrumb(scope, page),
          snippet: match.snippet,
          matchedTags: match.matchedTags,
        },
      ];
    });

    return { tags: result.tags, pages };
  });
