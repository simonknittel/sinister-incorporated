import { prisma } from "@/db";
import {
  EventContainerKind,
  type EventContainer,
} from "@/modules/events/utils/eventContainer";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  buildContainerWikiSearchFilters,
  GLOBAL_WIKI_SEARCH_FILTERS,
  queryWikiSearch,
  WikiSearchContainerColumn,
  type WikiSearchScopeFilters,
} from "@sam-monorepo/application";
import type { Variant } from "@sam-monorepo/database/client";
import { Prisma } from "@sam-monorepo/database/client";
import {
  WIKI_SEARCH_MARK_END,
  WIKI_SEARCH_MARK_START,
} from "@sam-monorepo/domain";
import { buildVisibleWikiBreadcrumb } from "../utils/buildVisibleWikiBreadcrumb";
import {
  getEventWikiContext,
  hasReadableEventWikiRoot,
} from "./getEventWikiContext";
import { getVariantWikiContext } from "./getVariantWikiContext";
import { getWikiContext, type WikiSharedContext } from "./getWikiContext";

export interface WikiSearchPageResult {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly iconId: string | null;
  /** Titles of the visible, not-deleted ancestors, root first */
  readonly breadcrumb: string[];
  /** Plain-text snippet with matches wrapped in the wiki search markers */
  readonly snippet: string;
  /** Names of the page's tags matching the query */
  readonly matchedTags: string[];
}

export interface WikiSearchTagResult {
  readonly id: string;
  readonly name: string;
}

interface WikiSearchResults {
  readonly tags: WikiSearchTagResult[];
  readonly pages: WikiSearchPageResult[];
}

const EMPTY_RESULTS: WikiSearchResults = { tags: [], pages: [] };

const RESULT_LIMIT = 20;
const TAG_RESULT_LIMIT = 5;

/** Full-text search over one scope's pages and tags (see `queryWikiSearch`) */
const runWikiSearch = async (
  context: WikiSharedContext,
  query: string,
  filters: WikiSearchScopeFilters,
): Promise<WikiSearchResults> => {
  const readablePageIds = [...context.permissions]
    .filter(([, permissions]) => permissions.canRead)
    .map(([pageId]) => pageId);

  const result = await queryWikiSearch(prisma, {
    query,
    readablePageIds,
    filters,
    snippetMarkers: {
      start: WIKI_SEARCH_MARK_START,
      end: WIKI_SEARCH_MARK_END,
    },
    pageLimit: RESULT_LIMIT,
    tagLimit: TAG_RESULT_LIMIT,
  });

  const pages = result.pages
    .map((match) => {
      const page = context.pagesById.get(match.id);
      if (!page) return null;

      return {
        id: page.id,
        title: page.title,
        slug: page.slug,
        iconId: page.iconId,
        breadcrumb: buildVisibleWikiBreadcrumb(context, page),
        snippet: match.snippet,
        matchedTags: match.matchedTags,
      };
    })
    .filter((page) => page !== null);

  return { tags: result.tags, pages };
};

/** Full-text search over the global wiki (briefings search separately) */
export const searchWiki = withTrace(
  "searchWiki",
  async (query: string): Promise<WikiSearchResults> => {
    const context = await getWikiContext();
    if (!context) return EMPTY_RESULTS;

    return runWikiSearch(context, query, GLOBAL_WIKI_SEARCH_FILTERS);
  },
);

const toContainerColumn = (container: EventContainer) => {
  switch (container.kind) {
    case EventContainerKind.Event:
      return WikiSearchContainerColumn.EventId;

    case EventContainerKind.Template:
      return WikiSearchContainerColumn.TemplateId;

    default:
      throw new Error(
        `Unknown event container kind: ${container.kind satisfies never}`,
      );
  }
};

/** Full-text search limited to one container's briefing pages and tags */
export const searchEventWiki = withTrace(
  "searchEventWiki",
  async (
    container: EventContainer,
    query: string,
  ): Promise<WikiSearchResults> => {
    const context = await getEventWikiContext(container);
    if (!context) return EMPTY_RESULTS;
    /**
     * Without the briefing gate the page results would come back empty
     * anyway (parent-read gating), but the unfiltered tag branch would
     * still hand tag names to `event;read` holders the layout 404s.
     */
    if (!hasReadableEventWikiRoot(context)) return EMPTY_RESULTS;

    return runWikiSearch(
      context,
      query,
      buildContainerWikiSearchFilters(
        toContainerColumn(container),
        container.id,
      ),
    );
  },
);

/**
 * Full-text search limited to the wiki subtree embedded on a variant page.
 * The subtree restriction happens inside the SQL (before the candidate
 * limit), so global matches never crowd out subtree hits, and the extra
 * `AND` leaves the indexed tsvector expression untouched. Tag results are
 * limited to tags used inside the subtree — they link out to the global
 * wiki, whose tag pages then show everything readable.
 */
export const searchVariantWiki = withTrace(
  "searchVariantWiki",
  async (
    variantId: Variant["id"],
    query: string,
  ): Promise<WikiSearchResults> => {
    const context = await getVariantWikiContext(variantId);
    if (!context) return EMPTY_RESULTS;

    /** Never empty — the subtree always contains the root page */
    const subtreeIds = [...context.subtreePageIds];

    return runWikiSearch(context, query, {
      tagsFilter: Prisma.sql`"eventId" IS NULL AND "templateId" IS NULL AND "id" IN (SELECT "tagId" FROM "WikiPageTag" WHERE "pageId" IN (${Prisma.join(subtreeIds)}))`,
      pagesFilter: Prisma.sql`"namespace" = 'WIKI' AND "eventId" IS NULL AND "templateId" IS NULL AND "id" IN (${Prisma.join(subtreeIds)})`,
    });
  },
);
