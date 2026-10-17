import { Prisma } from "@sam-monorepo/database/client";
import type { ApplicationContext } from "../context.js";

export interface WikiSearchScopeFilters {
  /** WHERE fragment limiting WikiTag rows to the scope */
  readonly tagsFilter: Prisma.Sql;
  /** WHERE fragment limiting WikiPage rows to the scope */
  readonly pagesFilter: Prisma.Sql;
}

/** The global wiki, without the briefings of the events and the templates */
export const GLOBAL_WIKI_SEARCH_FILTERS: WikiSearchScopeFilters = {
  tagsFilter: Prisma.sql`"eventId" IS NULL AND "templateId" IS NULL`,
  /**
   * The namespace alone excludes briefing pages (a CHECK constraint ties
   * namespace EVENT to exactly one container); the container filters make
   * the exclusion explicit and index-friendly regardless.
   */
  pagesFilter: Prisma.sql`"namespace" = 'WIKI' AND "eventId" IS NULL AND "templateId" IS NULL`,
};

export enum WikiSearchContainerColumn {
  EventId = "eventId",
  TemplateId = "templateId",
}

/** The briefing of one event or of one event template */
export const buildContainerWikiSearchFilters = (
  column: WikiSearchContainerColumn,
  containerId: string,
): WikiSearchScopeFilters => {
  const containerColumn = Prisma.raw(`"${column}"`);

  return {
    tagsFilter: Prisma.sql`${containerColumn} = ${containerId}`,
    pagesFilter: Prisma.sql`"namespace" = 'EVENT' AND ${containerColumn} = ${containerId}`,
  };
};

/**
 * `websearch_to_tsquery` safely handles arbitrary user input; the last word
 * additionally matches as a prefix so search-as-you-type finds partially
 * typed words. The prefix term replaces (rather than ANDs with) the last
 * websearch word: a partial word often stems differently than the full
 * words it is a prefix of, and requiring both would drop those matches.
 */
const buildTsquery = (query: string): Prisma.Sql => {
  const terms = query.split(/\s+/).filter(Boolean);
  const lastTerm = (terms.at(-1) ?? "").replace(/[^\p{L}\p{N}]/gu, "");
  const head = terms.slice(0, -1).join(" ");

  if (!lastTerm) return Prisma.sql`websearch_to_tsquery('german', ${query})`;

  const prefix = Prisma.sql`to_tsquery('german', ${`${lastTerm}:*`})`;
  if (!head) return prefix;

  return Prisma.sql`(websearch_to_tsquery('german', ${head}) && ${prefix})`;
};

export interface WikiSearchQueryOptions {
  readonly query: string;
  /** The search returns only these pages: the pages the viewer can read */
  readonly readablePageIds: readonly string[];
  readonly filters: WikiSearchScopeFilters;
  /** The text that `ts_headline` puts around each match in the snippet */
  readonly snippetMarkers: { readonly start: string; readonly end: string };
  readonly pageLimit: number;
  readonly tagLimit: number;
}

export interface WikiSearchQueryResult {
  readonly tags: { readonly id: string; readonly name: string }[];
  /** The matching pages, the best match first */
  readonly pages: {
    readonly id: string;
    /** Plain-text snippet with the matches wrapped in the snippet markers */
    readonly snippet: string;
    /** Names of the page's tags matching the query */
    readonly matchedTags: string[];
  }[];
}

/**
 * Full-text search over one scope's pages and tags. The query gets the ids
 * of the pages that the viewer may read and limits there, so invisible pages
 * never leak and a viewer with narrow access still gets a full result list.
 * Tag results are deliberately not permission-filtered — tag names are
 * shared within their scope, like the autocomplete in getTags — and the
 * tag's list page permission-filters its content itself. Tags match
 * through the same tsquery as pages, so a returned tag row and the tag
 * chips on page results always agree.
 */
export const queryWikiSearch = async (
  prisma: ApplicationContext["prisma"],
  {
    query,
    readablePageIds,
    filters,
    snippetMarkers,
    pageLimit,
    tagLimit,
  }: WikiSearchQueryOptions,
): Promise<WikiSearchQueryResult> => {
  const tsquery = buildTsquery(query.trim());
  const headlineOptions = `StartSel=${snippetMarkers.start}, StopSel=${snippetMarkers.end}, MaxWords=25, MinWords=10, ShortWord=2, MaxFragments=2`;

  const tags = await prisma.$queryRaw<WikiSearchQueryResult["tags"]>`
    SELECT "id", "name"
    FROM "WikiTag"
    WHERE ${filters.tagsFilter}
      AND to_tsvector('german', "name") @@ ${tsquery}
    ORDER BY "name"
    LIMIT ${tagLimit}
  `;

  if (readablePageIds.length === 0) return { tags, pages: [] };

  /**
   * The expression inside to_tsvector must match the expression GIN index
   * on WikiPage exactly, otherwise the index is not used.
   *
   * The snippet deliberately excludes tagsText — tag matches are shown as
   * chips instead, so a tag name never poses as page content. A tag only
   * counts as matched when it satisfies the whole tsquery by itself: with
   * a multi-word query, a tag contributing just one of the words keeps
   * the page in the results (via tagsText) but is not returned as a chip.
   *
   * The tag name is cast to text: the driver adapter does not know the
   * array type of `citext` and returns such an array as one string.
   */
  const pages = await prisma.$queryRaw<WikiSearchQueryResult["pages"]>`
    SELECT
      "id",
      ts_headline('german', "title" || ' ' || "searchText", ${tsquery}, ${headlineOptions}) AS "snippet",
      ARRAY(
        SELECT "WikiTag"."name"::text
        FROM "WikiPageTag"
        INNER JOIN "WikiTag" ON "WikiTag"."id" = "WikiPageTag"."tagId"
        WHERE "WikiPageTag"."pageId" = "WikiPage"."id"
          AND to_tsvector('german', "WikiTag"."name") @@ ${tsquery}
        ORDER BY "WikiTag"."name"
      ) AS "matchedTags"
    FROM "WikiPage"
    WHERE ${filters.pagesFilter}
      AND "deletedAt" IS NULL
      AND "id" = ANY(${readablePageIds}::text[])
      AND to_tsvector('german', "title" || ' ' || "tagsText" || ' ' || "searchText") @@ ${tsquery}
    ORDER BY ts_rank(to_tsvector('german', "title" || ' ' || "tagsText" || ' ' || "searchText"), ${tsquery}) DESC
    LIMIT ${pageLimit}
  `;

  return { tags, pages };
};
