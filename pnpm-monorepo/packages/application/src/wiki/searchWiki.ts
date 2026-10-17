import { buildWikiPageHref } from "@sam-monorepo/wiki-editor/helpers";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { idSchema, pageLimitSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import {
  loadReadableWikiScope,
  ReadableWikiScopeKind,
  type ReadableWikiScope,
} from "./readableWikiScope.js";
import {
  buildContainerWikiSearchFilters,
  GLOBAL_WIKI_SEARCH_FILTERS,
  queryWikiSearch,
  WikiSearchContainerColumn,
} from "./wikiSearchQuery.js";

/** The search returns at most this number of tags */
const TAG_RESULT_LIMIT = 5;

/**
 * Control characters cannot occur in the extracted page text, thus the
 * markers of the matches cannot collide with the content. The use case
 * replaces them with the Markdown markers of bold text.
 */
const SNIPPET_MARKERS = { start: "\u0001", end: "\u0002" } as const;

export const searchWikiInputSchema = z.object({
  query: z.string().trim().min(2).max(200),
  event_id: idSchema
    .optional()
    .describe("The briefing of this event instead of the global wiki."),
  limit: pageLimitSchema,
});

export type SearchWikiInput = z.output<typeof searchWikiInputSchema>;

export interface SearchWikiOutput {
  /** The best match first */
  readonly pages: {
    readonly id: string;
    readonly title: string;
    /** The route of the page, relative to the base URL of the app */
    readonly path: string;
    /** Plain text around the matches, with the matches in `**` */
    readonly snippet: string;
    /** The names of the tags of the page that match the query */
    readonly matched_tags: string[];
  }[];
  /** The tags of the scope that match the query */
  readonly tags: { readonly id: string; readonly name: string }[];
}

const toSearchFilters = (scope: ReadableWikiScope) => {
  switch (scope.kind) {
    case ReadableWikiScopeKind.Wiki:
      return GLOBAL_WIKI_SEARCH_FILTERS;

    case ReadableWikiScopeKind.Event:
      return buildContainerWikiSearchFilters(
        WikiSearchContainerColumn.EventId,
        scope.eventId,
      );

    default:
      throw new Error(`Unknown wiki scope: ${scope satisfies never}`);
  }
};

/**
 * Full-text search over the pages that the actor can read and over the tags
 * of the global wiki or of the briefing of an event
 */
export const searchWiki = (
  context: ApplicationContext,
  actor: Actor,
  input: SearchWikiInput,
): Promise<SearchWikiOutput> =>
  withSpan(context, "searchWiki", async () => {
    const scope = await loadReadableWikiScope(context, actor, input.event_id);

    const readablePageIds = [...scope.context.permissions]
      .filter(([, permissions]) => permissions.canRead)
      .map(([pageId]) => pageId);

    const result = await queryWikiSearch(context.prisma, {
      query: input.query,
      readablePageIds,
      filters: toSearchFilters(scope),
      snippetMarkers: SNIPPET_MARKERS,
      pageLimit: input.limit,
      tagLimit: TAG_RESULT_LIMIT,
    });

    const pages = result.pages.flatMap((match) => {
      const page = scope.context.pagesById.get(match.id);
      if (!page) return [];

      return [
        {
          id: page.id,
          title: page.title,
          path: buildWikiPageHref(scope.hrefBase, page),
          snippet: match.snippet
            .replaceAll(SNIPPET_MARKERS.start, "**")
            .replaceAll(SNIPPET_MARKERS.end, "**"),
          matched_tags: match.matchedTags,
        },
      ];
    });

    return {
      pages,
      tags: result.tags.map((tag) => ({ id: tag.id, name: tag.name })),
    };
  });
