import {
  WIKI_SEARCH_MARK_END,
  WIKI_SEARCH_MARK_START,
} from "@sam-monorepo/domain";
import { buildWikiPageHref } from "@sam-monorepo/wiki-editor/helpers";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { idSchema, pageLimitSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { loadReadableWikiScope } from "./readableWikiScope.js";
import { queryWikiSearch } from "./wikiSearchQuery.js";

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
    const result = await queryWikiSearch(context.prisma, {
      query: input.query,
      scope,
      pageLimit: input.limit,
    });

    const pages = result.pages.map(({ page, snippet, matchedTags }) => ({
      id: page.id,
      title: page.title,
      path: buildWikiPageHref(scope.hrefBase, page),
      snippet: snippet
        .replaceAll(WIKI_SEARCH_MARK_START, "**")
        .replaceAll(WIKI_SEARCH_MARK_END, "**"),
      matched_tags: matchedTags,
    }));

    return {
      pages,
      tags: result.tags.map((tag) => ({ id: tag.id, name: tag.name })),
    };
  });
