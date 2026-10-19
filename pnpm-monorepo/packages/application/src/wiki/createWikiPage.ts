import {
  WikiPageEditability,
  WikiPageNamespace,
  WikiPageUploadability,
  WikiPageVisibility,
} from "@sam-monorepo/database/client";
import {
  AuditEventType,
  slugifyWikiPageTitle,
  WIKI_PAGE_CONTENT_JSON_MAX_LENGTH,
  WIKI_PAGE_TITLE_MAX_LENGTH,
} from "@sam-monorepo/domain";
import { parseMarkdownToWikiContent } from "@sam-monorepo/wiki-editor/markdown";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ConflictError, NotFoundError, ValidationError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { getWikiPage, type GetWikiPageOutput } from "./getWikiPage.js";
import {
  loadReadableWikiScope,
  ReadableWikiScopeKind,
} from "./readableWikiScope.js";
import { DisallowedWikiIframesError, WikiErrorMessage } from "./wikiErrors.js";
import { findDisallowedWikiIframeSources } from "./wikiIframeAllowlist.js";
import {
  requireWikiPagePlacement,
  type WikiPlacementScope,
} from "./wikiPagePlacement.js";

/**
 * About 3,000 words. The parser (marked) needs time that grows with the
 * square of the length for some texts: the worst case that was measured is
 * one paragraph with many `*` or `_` without a match, about 2.5 seconds for
 * 20,000 characters. A longer text could keep the server busy for much
 * longer.
 */
const MAX_MARKDOWN_LENGTH = 20_000;

export const createWikiPageInputSchema = z.object({
  title: z.string().trim().min(1).max(WIKI_PAGE_TITLE_MAX_LENGTH),
  parent_id: idSchema
    .optional()
    .describe(
      "The page below which the new page goes. The user must manage it. Without parent_id and event_id, the page goes to the top of the global wiki, where only the user can see it at first.",
    ),
  event_id: idSchema
    .optional()
    .describe(
      "The event whose briefing gets the page. Without parent_id, the page goes below the root page of the briefing.",
    ),
  markdown: z
    .string()
    .max(MAX_MARKDOWN_LENGTH)
    .optional()
    .describe(
      `The content as Markdown (CommonMark with the tables and the task lists of GitHub), at most ${MAX_MARKDOWN_LENGTH} characters. Without it, the page is empty.`,
    ),
});

export type CreateWikiPageInput = z.output<typeof createWikiPageInputSchema>;

/** The new page, as the app needs it for its redirect */
export interface CreatedWikiPage {
  readonly id: string;
  readonly slug: string;
  readonly eventId: string | null;
  readonly templateId: string | null;
}

interface PreparedContent {
  readonly collab: NonNullable<ApplicationContext["collab"]>;
  /** Tiptap JSON that agrees with the schema of the editor */
  readonly content: object;
}

/**
 * The Markdown as the content of a wiki page. The checks run before the page
 * exists, thus a refusal leaves no empty page behind.
 */
const prepareContent = (
  context: ApplicationContext,
  markdown: string,
): Promise<PreparedContent> =>
  withSpan(context, "prepareWikiPageContent", async () => {
    // The content of a page changes only through the collab server
    if (!context.collab)
      throw new ConflictError(WikiErrorMessage.CollabNotConfigured);

    let content: object;
    try {
      content = parseMarkdownToWikiContent(markdown, {
        baseUrl: context.urls.baseUrl,
      });
    } catch (error) {
      throw new ValidationError(
        "The Markdown cannot become the content of a wiki page, for example because it is nested too deep",
        { cause: error },
      );
    }
    if (JSON.stringify(content).length > WIKI_PAGE_CONTENT_JSON_MAX_LENGTH)
      throw new ValidationError("The content is too large");

    // Like the content import of the app
    const disallowedSources = await findDisallowedWikiIframeSources(
      context.prisma,
      content,
    );
    if (disallowedSources.length > 0)
      throw new DisallowedWikiIframesError(disallowedSources);

    return { collab: context.collab, content };
  });

/**
 * Creates a page below the parent, or at the top of the global wiki without
 * a parent, in the scope that the caller loaded for the actor: the app also
 * loads the briefings of the event templates, which the MCP tools do not
 * show. With Markdown, the content goes through the collab server, thus open
 * editors get it.
 *
 * @param scope The scope of the parent (see `requireWikiPagePlacement()`)
 */
export const createWikiPageInScope = (
  context: ApplicationContext,
  actor: Actor,
  input: Omit<CreateWikiPageInput, "event_id">,
  scope: WikiPlacementScope | null,
): Promise<CreatedWikiPage> =>
  withSpan(context, "createWikiPageInScope", async () => {
    const citizen = requireCitizen(actor);
    const { context: wiki } = requireWikiPagePlacement(
      actor,
      scope,
      input.parent_id,
    );
    const prepared =
      input.markdown === undefined
        ? null
        : await prepareContent(context, input.markdown);

    const parentId = input.parent_id ?? null;
    const parent = parentId === null ? null : wiki.pagesById.get(parentId);
    const eventId = parent?.eventId ?? null;
    const templateId = parent?.templateId ?? null;
    const siblings = wiki.pages.filter((page) => page.parentId === parentId);
    const sortOrder =
      siblings.length > 0
        ? Math.max(...siblings.map((page) => page.sortOrder)) + 1
        : 0;

    /**
     * Defaults: top-level pages are "private" (RESTRICTED without roles) and
     * owned by their creator; child pages inherit everything including the
     * owner. Briefing pages always have a parent: they inherit their scopes
     * (the column defaults) and use no owner — the fixed manage tier
     * replaces it.
     */
    const page = await context.prisma.wikiPage.create({
      data: {
        title: input.title,
        slug: slugifyWikiPageTitle(input.title),
        parentId,
        namespace:
          eventId || templateId
            ? WikiPageNamespace.EVENT
            : WikiPageNamespace.WIKI,
        eventId,
        templateId,
        sortOrder,
        visibility: parent
          ? WikiPageVisibility.INHERIT
          : WikiPageVisibility.RESTRICTED,
        editability: parent
          ? WikiPageEditability.INHERIT
          : WikiPageEditability.RESTRICTED,
        imageUploadability: parent
          ? WikiPageUploadability.INHERIT
          : WikiPageUploadability.RESTRICTED,
        attachmentUploadability: parent
          ? WikiPageUploadability.INHERIT
          : WikiPageUploadability.RESTRICTED,
        ownerId: parent ? null : citizen.id,
        createdById: citizen.id,
      },
      select: { id: true, slug: true },
    });

    await context.audit.create([
      {
        type: AuditEventType.WIKI_PAGE_CREATED,
        data: {
          pageId: page.id,
          eventId: eventId ?? undefined,
          title: input.title,
          parentId,
        },
        createdById: actor.userId,
      },
    ]);

    if (prepared) {
      try {
        await prepared.collab.replaceContent({
          pageId: page.id,
          content: prepared.content,
          updatedByEntityId: citizen.id,
        });
      } catch (error) {
        context.log.error(
          "The collab server did not take the content of a new wiki page",
          { pageId: page.id, error },
        );
        throw new ConflictError(
          `The page ${page.id} exists, but it is empty: the collab server did not take the content`,
          { cause: error },
        );
      }

      /**
       * Like the end of an editor session: the collab server writes no
       * audit event for a replacement
       */
      await context.audit.create([
        {
          type: AuditEventType.WIKI_PAGE_UPDATED,
          data: { pageId: page.id },
          createdById: actor.userId,
        },
      ]);
    }

    return { id: page.id, slug: page.slug, eventId, templateId };
  });

/**
 * The event of the parent page, or undefined for a page of the global wiki.
 * The briefings of the event templates are not available, like for
 * `getWikiPage()`.
 */
const loadEventIdOfParent = async (
  context: ApplicationContext,
  parentId: string,
  eventId: string | undefined,
): Promise<string | undefined> => {
  const parent = await context.prisma.wikiPage.findUnique({
    where: { id: parentId },
    select: { namespace: true, eventId: true },
  });
  if (
    !parent ||
    (parent.namespace === WikiPageNamespace.EVENT && !parent.eventId) ||
    (eventId !== undefined && parent.eventId !== eventId)
  )
    throw new NotFoundError(WikiErrorMessage.ParentPageNotFound);

  return parent.eventId ?? undefined;
};

/**
 * Creates a page in the global wiki or in the briefing of an event, with its
 * content from Markdown, and gives the new page like `getWikiPage()`.
 *
 * @throws ConflictError when the collab server is not configured (only with
 * Markdown) or when the event of the briefing is over
 */
export const createWikiPage = (
  context: ApplicationContext,
  actor: Actor,
  input: CreateWikiPageInput,
): Promise<GetWikiPageOutput> =>
  withSpan(context, "createWikiPage", async () => {
    const eventId =
      input.parent_id === undefined
        ? input.event_id
        : await loadEventIdOfParent(context, input.parent_id, input.event_id);
    const scope = await loadReadableWikiScope(context, actor, eventId);
    const parentId =
      input.parent_id ??
      (scope.kind === ReadableWikiScopeKind.Event
        ? scope.context.rootPage.id
        : undefined);

    const page = await createWikiPageInScope(
      context,
      actor,
      { title: input.title, parent_id: parentId, markdown: input.markdown },
      scope,
    );

    return getWikiPage(context, actor, { page_id: page.id });
  });
