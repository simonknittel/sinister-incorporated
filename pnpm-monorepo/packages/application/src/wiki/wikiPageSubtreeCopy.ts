import {
  WikiPageEditability,
  WikiPageUploadability,
  WikiPageVisibility,
} from "@sam-monorepo/database/client";
import {
  AuditEventType,
  collectVisibleWikiSubtree,
  slugifyWikiPageTitle,
  type AuditEventInput,
  type EventContainer,
} from "@sam-monorepo/domain";
import { compareWikiPagesByOrder } from "@sam-monorepo/wiki-editor/helpers";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { LONG_TRANSACTION_TIMEOUT_IN_MILLISECONDS } from "../eventTemplates/containerContentCopy.js";
import {
  getAccessibleWikiPage,
  WikiPageAccessTier,
} from "./getAccessibleWikiPage.js";
import type { WikiSharedContextPage } from "./wikiContext.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import {
  copyWikiPagesIntoContainer,
  INHERITED_PERMISSIONS,
  type CopiedWikiPage,
  type WikiPageCopyEntry,
} from "./wikiPageCopy.js";
import { loadWikiScopeOfPage, type WikiPageScope } from "./wikiScope.js";
import { WikiScopeKind } from "./wikiScopeKind.js";

export enum WikiPageCopyDestinationKind {
  /** The copied root becomes a new page below the parent */
  NewPage = "newPage",
  /**
   * Only the copied children are created, after the existing children of
   * the page. The page itself (its content and attributes) is the business
   * of the caller: the paste that replaces a page.
   */
  IntoExistingPage = "intoExistingPage",
}

export type WikiPageCopyDestination =
  | {
      readonly kind: WikiPageCopyDestinationKind.NewPage;
      /** Undefined copies to the top level, which only the global wiki has */
      readonly parentId: string | undefined;
      readonly rootTitle: string;
    }
  | {
      readonly kind: WikiPageCopyDestinationKind.IntoExistingPage;
      readonly pageId: string;
    };

interface CopyWikiPageSubtreeOptions {
  readonly sourceScope: WikiPageScope;
  /** The caller checks that the actor can read it */
  readonly sourcePage: WikiSharedContextPage;
  /** Copy the subtree of the source that the actor can read */
  readonly includeChildren: boolean;
  /** Can be different from the scope of the source: copies are new rows */
  readonly targetScope: WikiPageScope;
  /** The caller checks that the actor can put pages there */
  readonly destination: WikiPageCopyDestination;
  /** The creator of the copies and the owner of a top-level copy */
  readonly createdByEntityId: string;
}

interface CopyWikiPageSubtreeResult {
  readonly root: { readonly id: string; readonly slug: string };
  /**
   * All created pages, the copied root first. For a copy into an existing
   * page, the root is that page, which this list does not contain.
   */
  readonly copiedPages: CopiedWikiPage[];
}

/** The briefing of the scope, or null for the global wiki */
export const getWikiPageScopeContainer = (
  scope: WikiPageScope,
): EventContainer | null => {
  switch (scope.kind) {
    case WikiScopeKind.Wiki:
      return null;

    case WikiScopeKind.Briefing:
      return scope.container;

    default:
      throw new Error(`Unknown wiki page scope: ${scope satisfies never}`);
  }
};

/**
 * The page that a copy reads, in its own scope: a copy needs only read
 * access to its source
 *
 * @throws NotFoundError when the page does not exist for the actor
 */
export const requireWikiPageCopySource = async (
  context: ApplicationContext,
  actor: Actor,
  pageId: string,
): Promise<{
  readonly sourceScope: WikiPageScope;
  readonly sourcePage: WikiSharedContextPage;
}> => {
  const sourceScope = await loadWikiScopeOfPage(context, actor, pageId);
  const sourcePage = sourceScope
    ? getAccessibleWikiPage<WikiSharedContextPage>(
        sourceScope,
        pageId,
        WikiPageAccessTier.Read,
      )
    : null;
  if (!sourceScope || !sourcePage)
    throw new NotFoundError(WikiErrorMessage.SourcePageNotFound);

  return { sourceScope, sourcePage };
};

/**
 * Creates copies of a page — optionally with the subtree the viewer can see
 * (an unreadable page hides its whole subtree, so neither it nor anything
 * below it is copied) — at the destination, which may live in a different
 * scope than the source: unlike moving, copying may cross the namespace
 * boundary because the copies are new rows that take namespace and
 * container from their new place.
 *
 * No copy carries the source's permissions over: like a moved page they
 * take the permissions of their new place, so all tiers are INHERIT (the
 * briefing scope columns keep their INHERIT defaults for the same reason)
 * and a top-level copy gets the defaults of a newly created top-level page.
 * A copy can thereby reach a wider audience than its source. Placing it
 * takes managing the target, so that is the target's manager to decide,
 * and the dialogs say so.
 */
export const copyWikiPageSubtree = async (
  context: Pick<ApplicationContext, "prisma">,
  {
    sourceScope,
    sourcePage,
    includeChildren,
    targetScope,
    destination,
    createdByEntityId,
  }: CopyWikiPageSubtreeOptions,
): Promise<CopyWikiPageSubtreeResult> => {
  const sourcePages: readonly WikiSharedContextPage[] = sourceScope.pages;
  const targetPages: readonly WikiSharedContextPage[] = targetScope.pages;
  const targetPagesById: ReadonlyMap<string, WikiSharedContextPage> =
    targetScope.pagesById;
  const targetContainer = getWikiPageScopeContainer(targetScope);
  if (
    destination.kind === WikiPageCopyDestinationKind.NewPage &&
    !destination.parentId &&
    targetContainer
  )
    throw new Error("Briefings have no top level to copy to");

  const subtree = includeChildren
    ? collectVisibleWikiSubtree(
        sourcePages,
        sourcePage.id,
        (id) => sourceScope.permissions.get(id)?.canRead === true,
      )
    : [];

  /**
   * New pages append after the existing children of their landing spot:
   * the copied root after the parent's children, or — into an existing
   * page — the copied top-level children after that page's own. Deeper
   * copies keep their source sortOrder (their parent is a fresh copy).
   */
  const appendUnderId =
    destination.kind === WikiPageCopyDestinationKind.NewPage
      ? (destination.parentId ?? null)
      : destination.pageId;
  const existingChildren = targetPages.filter(
    (page) => page.parentId === appendUnderId,
  );
  const appendBase =
    existingChildren.length > 0
      ? Math.max(...existingChildren.map((page) => page.sortOrder)) + 1
      : 0;
  const rebasedSortOrders = new Map<string, number>();
  if (destination.kind === WikiPageCopyDestinationKind.IntoExistingPage) {
    const directChildren = subtree
      .filter((entry) => entry.visibleParentId === sourcePage.id)
      .map((entry) => entry.page)
      .toSorted(compareWikiPagesByOrder);
    directChildren.forEach((page, index) =>
      rebasedSortOrders.set(page.id, appendBase + index),
    );
  }

  const rootPermissions: WikiPageCopyEntry["permissions"] =
    destination.kind === WikiPageCopyDestinationKind.NewPage &&
    !destination.parentId
      ? {
          visibility: WikiPageVisibility.RESTRICTED,
          editability: WikiPageEditability.RESTRICTED,
          imageUploadability: WikiPageUploadability.RESTRICTED,
          attachmentUploadability: WikiPageUploadability.RESTRICTED,
          ownerId: createdByEntityId,
        }
      : INHERITED_PERMISSIONS;

  /**
   * The existing page a replace-paste copies into. Its children get created
   * underneath it, the page itself is left to the caller.
   */
  const destinationPage =
    destination.kind === WikiPageCopyDestinationKind.IntoExistingPage
      ? targetPagesById.get(destination.pageId)
      : undefined;
  if (
    destination.kind === WikiPageCopyDestinationKind.IntoExistingPage &&
    !destinationPage
  )
    throw new Error("The destination page is missing from its scope");

  const entries: WikiPageCopyEntry[] =
    destination.kind === WikiPageCopyDestinationKind.NewPage
      ? [
          {
            source: sourcePage,
            title: destination.rootTitle,
            slug: slugifyWikiPageTitle(destination.rootTitle),
            parentSourceId: null,
            sortOrder: appendBase,
            permissions: rootPermissions,
          },
        ]
      : [];

  /** Subtree entries are depth-first: parents always precede children */
  for (const { page, visibleParentId } of subtree)
    entries.push({
      source: page,
      title: page.title,
      slug: page.slug,
      parentSourceId: visibleParentId,
      sortOrder: rebasedSortOrders.get(page.id) ?? page.sortOrder,
      permissions: INHERITED_PERMISSIONS,
    });

  return context.prisma.$transaction(
    async (transaction) => {
      const { copiedPages, newIdBySourceId, slugBySourceId } =
        await copyWikiPagesIntoContainer(transaction, {
          entries,
          targetContainer,
          rootParentId: appendUnderId,
          initialIdBySourceId: destinationPage
            ? new Map([[sourcePage.id, destinationPage.id]])
            : undefined,
          createdByEntityId,
        });

      const root = destinationPage
        ? { id: destinationPage.id, slug: destinationPage.slug }
        : {
            id: newIdBySourceId.get(sourcePage.id)!,
            slug: slugBySourceId.get(sourcePage.id)!,
          };

      return { root, copiedPages };
    },
    { timeout: LONG_TRANSACTION_TIMEOUT_IN_MILLISECONDS },
  );
};

/**
 * One audit event for each page that a copy created, and for the page that
 * took over the content of the copied root
 *
 * @param eventId The event of the target briefing, or null
 * @param replacedPageId The existing page that took over the content of the
 * copied root (the paste that replaces a page)
 */
export const buildWikiPageCopiedAuditEvents = (
  copiedPages: readonly CopiedWikiPage[],
  rootPageId: string,
  eventId: string | null,
  createdById: string,
  replacedPageId?: string,
): AuditEventInput[] =>
  copiedPages.map((page) => ({
    type: AuditEventType.WIKI_PAGE_COPIED,
    data: {
      pageId: page.id,
      eventId: eventId ?? undefined,
      sourcePageId: page.sourcePageId,
      title: page.title,
      parentId: page.parentId,
      rootPageId,
      ...(page.id === replacedPageId ? { replacedExistingPage: true } : {}),
    },
    createdById,
  }));
