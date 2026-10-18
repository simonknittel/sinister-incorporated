import { prisma } from "@/db";
import type { EventContainer } from "@/modules/events/utils/eventContainer";
import {
  copyWikiPagesIntoContainer,
  INHERITED_PERMISSIONS,
  type CopiedWikiPage,
  type WikiPageCopyEntry,
} from "@sam-monorepo/application";
import {
  WikiPageEditability,
  WikiPageUploadability,
  WikiPageVisibility,
} from "@sam-monorepo/database/client";
import { slugifyWikiPageTitle } from "@sam-monorepo/domain";
import { compareWikiPagesByOrder } from "@sam-monorepo/wiki-editor/helpers";
import type { WikiSharedContextPage } from "../queries/getWikiContext";
import type { WikiPageScopedContext } from "../queries/getWikiPageScopedContext";
import { collectVisibleWikiSubtree } from "./collectVisibleWikiSubtree";
import { WikiScope } from "./wikiPageHref";

const TRANSACTION_TIMEOUT_MS = 30_000;

type CopyWikiPageDestination =
  | {
      /** The copied root becomes a new page underneath parentId */
      readonly kind: "newPage";
      /** Undefined copies to the top level, which only exists in the global wiki */
      readonly parentId: string | undefined;
      readonly rootTitle: string;
    }
  | {
      /**
       * Only the copied children are created, appended after the existing
       * children of this page. The page itself (content, attributes) is the
       * caller's business — used by the paste action's replace mode.
       */
      readonly kind: "intoExistingPage";
      readonly pageId: string;
    };

interface CopyWikiPageSubtreeOptions {
  readonly sourceScoped: WikiPageScopedContext;
  /** Must be readable by the viewer — callers check */
  readonly sourcePage: WikiSharedContextPage;
  /** Copy the source's readable subtree along with it */
  readonly includeChildren: boolean;
  /** May differ from the source's scope: copies are new rows */
  readonly targetScoped: WikiPageScopedContext;
  /** Must be an allowed placement in the target scope — callers check */
  readonly destination: CopyWikiPageDestination;
  /** Creator of the copies; becomes the owner of a top-level copy */
  readonly createdByEntityId: string;
}

interface CopyWikiPageSubtreeResult {
  readonly root: { readonly id: string; readonly slug: string };
  /**
   * All created pages, the copied root first — which for an
   * intoExistingPage destination is not part of this list.
   */
  readonly copiedPages: CopiedWikiPage[];
}

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
  options: CopyWikiPageSubtreeOptions,
): Promise<CopyWikiPageSubtreeResult> => {
  const { sourcePage, targetScoped, destination } = options;
  const sourceContext = options.sourceScoped.context;
  const targetContext = targetScoped.context;
  const targetContainer: EventContainer | null =
    targetScoped.scope === WikiScope.Event
      ? targetScoped.context.container
      : null;
  if (
    destination.kind === "newPage" &&
    !destination.parentId &&
    targetContainer
  )
    throw new Error("Briefings have no top level to copy to");

  const subtree = options.includeChildren
    ? collectVisibleWikiSubtree<WikiSharedContextPage>(
        sourceContext.pages,
        sourcePage.id,
        (id) => sourceContext.permissions.get(id)?.canRead === true,
      )
    : [];

  /**
   * New pages append after the existing children of their landing spot:
   * the copied root after the parent's children, or — into an existing
   * page — the copied top-level children after that page's own. Deeper
   * copies keep their source sortOrder (their parent is a fresh copy).
   */
  const appendUnderId =
    destination.kind === "newPage"
      ? (destination.parentId ?? null)
      : destination.pageId;
  const existingChildren = targetContext.pages.filter(
    (page) => page.parentId === appendUnderId,
  );
  const appendBase =
    existingChildren.length > 0
      ? Math.max(...existingChildren.map((page) => page.sortOrder)) + 1
      : 0;
  const rebasedSortOrders = new Map<string, number>();
  if (destination.kind === "intoExistingPage") {
    const directChildren = subtree
      .filter((entry) => entry.visibleParentId === sourcePage.id)
      .map((entry) => entry.page)
      .toSorted(compareWikiPagesByOrder);
    directChildren.forEach((page, index) =>
      rebasedSortOrders.set(page.id, appendBase + index),
    );
  }

  const rootPermissions: WikiPageCopyEntry["permissions"] =
    destination.kind === "newPage" && !destination.parentId
      ? {
          visibility: WikiPageVisibility.RESTRICTED,
          editability: WikiPageEditability.RESTRICTED,
          imageUploadability: WikiPageUploadability.RESTRICTED,
          attachmentUploadability: WikiPageUploadability.RESTRICTED,
          ownerId: options.createdByEntityId,
        }
      : INHERITED_PERMISSIONS;

  /**
   * The existing page a replace-paste copies into. Its children get created
   * underneath it, the page itself is left to the caller.
   */
  const destinationPage =
    destination.kind === "intoExistingPage"
      ? targetContext.pagesById.get(destination.pageId)
      : undefined;
  if (destination.kind === "intoExistingPage" && !destinationPage)
    throw new Error("Destination page is missing from the context");

  const entries: WikiPageCopyEntry[] =
    destination.kind === "newPage"
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

  return await prisma.$transaction(
    async (transaction) => {
      const { copiedPages, newIdBySourceId, slugBySourceId } =
        await copyWikiPagesIntoContainer(transaction, {
          entries,
          targetContainer,
          rootParentId: appendUnderId,
          initialIdBySourceId: destinationPage
            ? new Map([[sourcePage.id, destinationPage.id]])
            : undefined,
          createdByEntityId: options.createdByEntityId,
        });

      const root = destinationPage
        ? { id: destinationPage.id, slug: destinationPage.slug }
        : {
            id: newIdBySourceId.get(sourcePage.id)!,
            slug: slugBySourceId.get(sourcePage.id)!,
          };

      return { root, copiedPages };
    },
    { timeout: TRANSACTION_TIMEOUT_MS },
  );
};
