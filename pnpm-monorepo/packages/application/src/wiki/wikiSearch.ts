import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";
import { buildVisibleWikiBreadcrumb } from "./wikiBreadcrumb.js";
import { findReadableWikiScope, type WikiScopeTarget } from "./wikiScope.js";
import { queryWikiSearch } from "./wikiSearchQuery.js";

/** The search returns at most this number of pages */
const MAXIMUM_WIKI_SEARCH_PAGES = 20;

export interface WikiSearchPageResult {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly iconId: string | null;
  /** Titles of the visible ancestors that are not in the trash, top first */
  readonly breadcrumb: string[];
  /**
   * Plain text around the matches, with the matches in
   * `WIKI_SEARCH_MARK_START` and `WIKI_SEARCH_MARK_END`
   */
  readonly snippet: string;
  /** The names of the tags of the page that match the query */
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
     * The gate of the briefing: without it, the page results are empty (the
     * gate of the parent), but the tag results give the names of the tags
     * to holders of `event;read` that the layout refuses
     */
    const scope = await findReadableWikiScope(context, actor, target);
    if (!scope) return EMPTY_RESULTS;

    const result = await queryWikiSearch(context.prisma, {
      query,
      scope,
      pageLimit: MAXIMUM_WIKI_SEARCH_PAGES,
    });

    return {
      tags: result.tags,
      pages: result.pages.map(({ page, snippet, matchedTags }) => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        iconId: page.iconId,
        breadcrumb: buildVisibleWikiBreadcrumb(scope, page),
        snippet,
        matchedTags,
      })),
    };
  });
