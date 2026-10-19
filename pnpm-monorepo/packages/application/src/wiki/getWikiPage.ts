import { WikiPageNamespace } from "@sam-monorepo/database/client";
import { collectWikiPageLinkIds } from "@sam-monorepo/wiki-editor";
import {
  buildWikiPageHref,
  type WikiPageHrefBase,
  type WikiPageLinkedPage,
} from "@sam-monorepo/wiki-editor/helpers";
import { renderWikiContentToMarkdown } from "@sam-monorepo/wiki-editor/markdown";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import {
  buildEventWikiContext,
  hasReadableEventWikiRoot,
} from "./eventWikiContext.js";
import {
  getAccessibleWikiPage,
  WikiPageAccessTier,
} from "./getAccessibleWikiPage.js";
import {
  loadWikiLinkedVariants,
  loadWikiMentionedCitizens,
} from "./wikiContentReferences.js";
import {
  buildWikiContext,
  type WikiSharedContext,
  type WikiSharedContextPage,
} from "./wikiContext.js";
import { loadWikiIframeAllowlist } from "./wikiIframeAllowlist.js";
import {
  createEventWikiHrefBase,
  GLOBAL_WIKI_HREF_BASE,
} from "./wikiPagePath.js";
import { canAddWikiChildren } from "./wikiPagePlacement.js";

export const getWikiPageInputSchema = z.object({
  page_id: idSchema,
});

export type GetWikiPageInput = z.output<typeof getWikiPageInputSchema>;

export interface WikiPageReference {
  readonly id: string;
  readonly title: string;
  /** The route of the page, relative to the base URL of the app */
  readonly path: string;
}

export interface GetWikiPageOutput extends WikiPageReference {
  readonly slug: string;
  readonly icon_id: string | null;
  /** Null for a page at the top of the tree */
  readonly parent_id: string | null;
  /** The event of a briefing page, null for a page of the global wiki */
  readonly event_id: string | null;
  readonly tags: { readonly id: string; readonly name: string }[];
  /** The readable pages that the content links to */
  readonly linked_pages: WikiPageReference[];
  /** ISO 8601 */
  readonly created_at: string;
  /** ISO 8601 */
  readonly updated_at: string;
  /** The content as Markdown */
  readonly markdown: string;
  /** Whether the user can add a page below this page (`create_wiki_page`) */
  readonly can_add_children: boolean;
}

/** A wiki scope that the actor can read, with the routes of its pages */
interface ReadableScope {
  readonly context: WikiSharedContext;
  readonly hrefBase: WikiPageHrefBase;
  /** True for the briefing of an event that is over: it refuses all changes */
  readonly frozen: boolean;
}

/**
 * The scopes whose pages the content of a page can link to, the scope of the
 * page first: an event page may link into the global wiki, never the other
 * way around.
 */
const loadScopesOfPage = async (
  context: ApplicationContext,
  actor: Actor,
  pageId: string,
): Promise<ReadableScope[]> => {
  const record = await context.prisma.wikiPage.findUnique({
    where: { id: pageId },
    select: { namespace: true, eventId: true },
  });
  if (!record) throw new NotFoundError("The wiki page does not exist");

  const globalScope = async (): Promise<ReadableScope> => ({
    context: await buildWikiContext(context, actor),
    hrefBase: GLOBAL_WIKI_HREF_BASE,
    frozen: false,
  });

  switch (record.namespace) {
    case WikiPageNamespace.WIKI:
      return [await globalScope()];

    case WikiPageNamespace.EVENT: {
      // The briefing blueprints of the event templates are not available
      const eventId = record.eventId;
      if (!eventId) throw new NotFoundError("The wiki page does not exist");

      const [eventContext, global] = await Promise.all([
        buildEventWikiContext(context, actor, { event_id: eventId }),
        globalScope(),
      ]);
      // The gate of the briefing layout
      if (!eventContext || !hasReadableEventWikiRoot(eventContext))
        throw new NotFoundError("The wiki page does not exist");

      return [
        {
          context: eventContext,
          hrefBase: createEventWikiHrefBase(eventId, eventContext.rootPage.id),
          frozen: eventContext.frozen,
        },
        global,
      ];
    }

    default:
      throw new Error(
        `Unknown wiki page namespace: ${record.namespace satisfies never}`,
      );
  }
};

const findReadablePage = (
  scopes: readonly ReadableScope[],
  pageId: string,
): { page: WikiSharedContextPage; path: string } | null => {
  for (const scope of scopes) {
    const page = getAccessibleWikiPage(
      scope.context,
      pageId,
      WikiPageAccessTier.Read,
    );
    if (page) return { page, path: buildWikiPageHref(scope.hrefBase, page) };
  }

  return null;
};

/**
 * A page of the global wiki or of the briefing of an event, with its content
 * as Markdown. A page that the actor cannot read does not exist for the
 * actor.
 */
export const getWikiPage = (
  context: ApplicationContext,
  actor: Actor,
  input: GetWikiPageInput,
): Promise<GetWikiPageOutput> =>
  withSpan(context, "getWikiPage", async () => {
    const scopes = await loadScopesOfPage(context, actor, input.page_id);
    const [ownScope] = scopes;
    const page =
      ownScope &&
      getAccessibleWikiPage(
        ownScope.context,
        input.page_id,
        WikiPageAccessTier.Read,
      );
    if (!ownScope || !page)
      throw new NotFoundError("The wiki page does not exist");

    const [record, pageTags, iframeAllowlist] = await Promise.all([
      context.prisma.wikiPage.findUnique({
        where: { id: page.id },
        select: { content: true },
      }),
      context.prisma.wikiPageTag.findMany({
        where: { pageId: page.id },
        select: { tag: { select: { id: true, name: true } } },
        orderBy: { tag: { name: "asc" } },
      }),
      loadWikiIframeAllowlist(context.prisma),
    ]);
    const content = record?.content ?? null;

    const [citizens, variants] = await Promise.all([
      loadWikiMentionedCitizens(
        context.prisma,
        actor.authorize("citizen", "read"),
        content,
      ),
      loadWikiLinkedVariants(
        context.prisma,
        content,
        context.urls.publicUploadBaseUrl,
      ),
    ]);

    const linkedPages: Record<string, WikiPageLinkedPage | null> = {};
    const linkedPageReferences: WikiPageReference[] = [];
    for (const linkedPageId of collectWikiPageLinkIds(content)) {
      const linked = findReadablePage(scopes, linkedPageId);
      linkedPages[linkedPageId] = linked && {
        title: linked.page.title,
        slug: linked.page.slug,
        href: linked.path,
      };
      if (linked)
        linkedPageReferences.push({
          id: linked.page.id,
          title: linked.page.title,
          path: linked.path,
        });
    }

    const parent = getAccessibleWikiPage(
      ownScope.context,
      page.parentId,
      WikiPageAccessTier.Read,
    );

    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      path: buildWikiPageHref(ownScope.hrefBase, page),
      icon_id: page.iconId,
      parent_id: parent?.id ?? null,
      event_id: page.eventId,
      tags: pageTags.map(({ tag }) => ({ id: tag.id, name: tag.name })),
      linked_pages: linkedPageReferences,
      created_at: page.createdAt.toISOString(),
      updated_at: page.updatedAt.toISOString(),
      markdown: renderWikiContentToMarkdown(content, {
        baseUrl: context.urls.baseUrl,
        pages: linkedPages,
        citizens,
        variants,
        iframeAllowlist,
      }),
      can_add_children: canAddWikiChildren(
        ownScope.context,
        page.id,
        ownScope.frozen,
      ),
    };
  });
