import {
  WIKI_PAGE_TITLE_MAX_LENGTH,
  wikiContainerColumns,
  WikiPasteMode,
  type EventContainer,
} from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor, type ActorCitizen } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ConflictError, NotFoundError, ValidationError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { findVariantWikiRootPageId } from "./variantWikiRedirect.js";
import type { WikiSharedContextPage } from "./wikiContext.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import type { CopiedWikiPage } from "./wikiPageCopy.js";
import {
  loadWikiScopeOfParent,
  requireWikiPagePlacement,
} from "./wikiPagePlacement.js";
import { createWikiPageSafetySnapshot } from "./wikiPageSafetySnapshot.js";
import {
  buildWikiPageCopiedAuditEvents,
  copyWikiPageSubtree,
  getWikiPageScopeContainer,
  requireWikiPageCopySource,
  WikiPageCopyDestinationKind,
} from "./wikiPageSubtreeCopy.js";
import type { WikiPageScope } from "./wikiScope.js";
import { findOrCreateWikiTags } from "./wikiTags.js";

/** The content of a page that was never saved */
const EMPTY_WIKI_DOCUMENT = { type: "doc", content: [] };

export const pasteWikiPagesInputSchema = z.object({
  /** A page that the actor can read */
  source_page_id: idSchema,
  /**
   * In the mode Child, the parent of the copy: without it, the copy goes to
   * the top of the global wiki. In the mode Replace, the page that takes
   * over the copied page (necessary).
   */
  target_page_id: idSchema.optional(),
  /** Copy the subtree of the source that the actor can read */
  include_children: z.boolean(),
  mode: z.enum(WikiPasteMode).default(WikiPasteMode.Child),
});

export type PasteWikiPagesInput = z.infer<typeof pasteWikiPagesInputSchema>;

/** Options of the use case for the app, not fields of the input schema */
export interface PasteWikiPagesOptions {
  /** Added to the title of the copy in the mode Child */
  readonly copyTitleSuffix: string;
  /**
   * The name of the snapshot that keeps the content of the page that the
   * mode Replace replaces
   */
  readonly safetySnapshotName: string;
  /**
   * The fleet variant whose embed of the global wiki shows the form, for the
   * redirect into the embed
   */
  readonly variantId?: string;
}

export interface PasteWikiPagesOutput {
  /** The page to open: the new copy, or the replaced page */
  readonly page_id: string;
  readonly slug: string;
  readonly event_id: string | null;
  readonly template_id: string | null;
  /** True when the mode Replace replaced the root page of a briefing */
  readonly is_briefing_root: boolean;
  /** The new pages, and the replaced page in the mode Replace */
  readonly copied_page_count: number;
  /**
   * Only with the option `variantId`: the linked page of the variant when
   * the page to open is in the embed of the variant, else null
   */
  readonly variant_wiki_page_id?: string | null;
}

interface PasteResult {
  readonly root: { readonly id: string; readonly slug: string };
  /** One entry for each page that took over copied content */
  readonly copiedPages: CopiedWikiPage[];
  /** The parent of the root, for the redirect into the embed of a variant */
  readonly rootParentId: string | null;
}

interface ReplaceParameters {
  readonly sourceScope: WikiPageScope;
  readonly sourcePage: WikiSharedContextPage;
  readonly targetScope: WikiPageScope;
  readonly targetContainer: EventContainer | null;
  readonly targetPage: WikiSharedContextPage;
  readonly includeChildren: boolean;
  readonly safetySnapshotName: string;
}

/**
 * The mode Replace: the target page keeps its identity (id, title,
 * permissions, parent, existing children) and takes over the content, the
 * icon, the tags and the sidebar mode of the copied page. The copied
 * children go after its existing children. The content goes through the
 * collab server, thus open editors get it, with a safety snapshot as the
 * undo path. The new child pages come last, thus a retry after a failure
 * cannot create pages two times.
 */
const replaceWikiPageWithCopy = async (
  context: ApplicationContext,
  citizen: ActorCitizen,
  {
    sourceScope,
    sourcePage,
    targetScope,
    targetContainer,
    targetPage,
    includeChildren,
    safetySnapshotName,
  }: ReplaceParameters,
): Promise<PasteResult> => {
  if (targetPage.id === sourcePage.id)
    throw new ValidationError(WikiErrorMessage.CannotReplaceWithItself);

  // The content of a page changes only through the collab server
  const { collab } = context;
  if (!collab) throw new ConflictError(WikiErrorMessage.CollabNotConfigured);

  const [sourceRow, sourceTagAssignments, targetTagAssignments] =
    await Promise.all([
      context.prisma.wikiPage.findUnique({
        where: { id: sourcePage.id },
        select: { content: true },
      }),
      context.prisma.wikiPageTag.findMany({
        where: { pageId: sourcePage.id },
        select: { tag: { select: { name: true } } },
      }),
      context.prisma.wikiPageTag.findMany({
        where: { pageId: targetPage.id },
        select: { tagId: true },
      }),
    ]);
  if (!sourceRow) throw new NotFoundError(WikiErrorMessage.SourcePageNotFound);

  await createWikiPageSafetySnapshot(context, {
    pageId: targetPage.id,
    name: safetySnapshotName,
    createdById: citizen.id,
  });

  try {
    await collab.replaceContent({
      pageId: targetPage.id,
      content: (sourceRow.content as object | null) ?? EMPTY_WIKI_DOCUMENT,
      updatedByEntityId: citizen.id,
    });
  } catch (error) {
    context.log.error("Wiki paste-replace failed", { error });
    throw new ConflictError(WikiErrorMessage.ReplaceFailed, { cause: error });
  }

  /**
   * The tags of the copied page replace the tags of the target page. A tag
   * that loses its last page goes away, like in `updateWikiPageTags`.
   */
  await context.prisma.$transaction(async (transaction) => {
    const tags = await findOrCreateWikiTags(
      transaction,
      sourceTagAssignments.map((assignment) => assignment.tag.name),
      targetContainer,
      citizen.id,
    );

    await transaction.wikiPageTag.deleteMany({
      where: { pageId: targetPage.id },
    });
    if (tags.length > 0)
      await transaction.wikiPageTag.createMany({
        data: tags.map((tag) => ({
          pageId: targetPage.id,
          tagId: tag.id,
          createdById: citizen.id,
        })),
        skipDuplicates: true,
      });
    await transaction.wikiTag.deleteMany({
      where: {
        id: {
          in: targetTagAssignments.map((assignment) => assignment.tagId),
        },
        pages: { none: {} },
      },
    });

    await transaction.wikiPage.update({
      where: { id: targetPage.id },
      data: {
        iconId: sourcePage.iconId,
        sidebarMode: sourcePage.sidebarMode,
        tagsText: tags
          .map((tag) => tag.name)
          .toSorted((first, second) => first.localeCompare(second))
          .join(" "),
        updatedById: citizen.id,
      },
      select: { id: true },
    });
  });

  const { root, copiedPages } = await copyWikiPageSubtree(context, {
    sourceScope,
    sourcePage,
    includeChildren,
    targetScope,
    destination: {
      kind: WikiPageCopyDestinationKind.IntoExistingPage,
      pageId: targetPage.id,
    },
    createdByEntityId: citizen.id,
  });

  return {
    root,
    copiedPages: [
      {
        id: targetPage.id,
        sourcePageId: sourcePage.id,
        title: targetPage.title,
        parentId: targetPage.parentId,
      },
      ...copiedPages,
    ],
    rootParentId: targetPage.parentId,
  };
};

/**
 * Inserts the copied page of the clipboard — optionally with its readable
 * subtree — as new pages: the second half of copy and paste. The clipboard
 * holds only a reference, thus the source is read again with the current
 * permissions of the actor and the last saved content. A copy from the
 * briefing of an event that is over is possible (it is a read), a paste
 * into it is not. See `copyWikiPageSubtree()` for the rules of a copy across
 * scopes.
 *
 * The mode Child puts the copy below the target page. The mode Replace puts
 * the copy onto the target page itself (see `replaceWikiPageWithCopy()`):
 * the only way to move a whole briefing onto the locked root page of a
 * different briefing.
 *
 * @throws NotFoundError when the source or the target does not exist for
 * the actor
 * @throws ForbiddenError when the actor does not manage the target, or
 * cannot create a page at the top level
 * @throws ConflictError when the event of the briefing is over, or the
 * collab server is not configured or did not take the content
 * @throws ValidationError for the mode Replace without a target or with the
 * source as the target
 */
export const pasteWikiPages = (
  context: ApplicationContext,
  actor: Actor,
  input: PasteWikiPagesInput,
  { copyTitleSuffix, safetySnapshotName, variantId }: PasteWikiPagesOptions,
): Promise<PasteWikiPagesOutput> =>
  withSpan(context, "pasteWikiPages", async () => {
    const citizen = requireCitizen(actor);

    const { sourceScope, sourcePage } = await requireWikiPageCopySource(
      context,
      actor,
      input.source_page_id,
    );

    if (
      input.mode === WikiPasteMode.Replace &&
      input.target_page_id === undefined
    )
      throw new ValidationError("The mode Replace needs a target page");

    const targetScope = requireWikiPagePlacement(
      actor,
      await loadWikiScopeOfParent(context, actor, input.target_page_id),
      input.target_page_id,
    );
    const targetContainer = getWikiPageScopeContainer(targetScope);
    const targetColumns = wikiContainerColumns(targetContainer);

    let result: PasteResult;
    let isBriefingRoot = false;
    switch (input.mode) {
      case WikiPasteMode.Child: {
        const rootTitle =
          sourcePage.title.slice(
            0,
            WIKI_PAGE_TITLE_MAX_LENGTH - copyTitleSuffix.length,
          ) + copyTitleSuffix;
        const { root, copiedPages } = await copyWikiPageSubtree(context, {
          sourceScope,
          sourcePage,
          includeChildren: input.include_children,
          targetScope,
          destination: {
            kind: WikiPageCopyDestinationKind.NewPage,
            parentId: input.target_page_id,
            rootTitle,
          },
          createdByEntityId: citizen.id,
        });
        result = {
          root,
          copiedPages,
          rootParentId: input.target_page_id ?? null,
        };
        break;
      }

      case WikiPasteMode.Replace: {
        const targetPage: WikiSharedContextPage | undefined =
          input.target_page_id === undefined
            ? undefined
            : targetScope.pagesById.get(input.target_page_id);
        /** The check of the placement guarantees the page */
        if (!targetPage) throw new Error("The target page is missing");

        result = await replaceWikiPageWithCopy(context, citizen, {
          sourceScope,
          sourcePage,
          targetScope,
          targetContainer,
          targetPage,
          includeChildren: input.include_children,
          safetySnapshotName,
        });
        isBriefingRoot =
          targetContainer !== null && targetPage.parentId === null;
        break;
      }

      default:
        throw new Error(
          `Unknown wiki paste mode: ${input.mode satisfies never}`,
        );
    }

    await context.audit.create(
      buildWikiPageCopiedAuditEvents(
        result.copiedPages,
        result.root.id,
        targetColumns.eventId,
        actor.userId,
        input.mode === WikiPasteMode.Replace ? result.root.id : undefined,
      ),
    );

    return {
      page_id: result.root.id,
      slug: result.root.slug,
      event_id: targetColumns.eventId,
      template_id: targetColumns.templateId,
      is_briefing_root: isBriefingRoot,
      copied_page_count: result.copiedPages.length,
      ...(variantId === undefined
        ? {}
        : {
            variant_wiki_page_id: await findVariantWikiRootPageId(
              context,
              targetScope,
              variantId,
              result.root.id,
              result.rootParentId,
            ),
          }),
    };
  });
