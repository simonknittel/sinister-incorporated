import type { PrismaClientType } from "@sam-monorepo/database";
import {
  WikiPageEditability,
  WikiPageEventScope,
  WikiPageUploadability,
  WikiPageVisibility,
  type Prisma,
} from "@sam-monorepo/database/client";
import { collectWikiPageDescendants } from "@sam-monorepo/domain";
import type { WikiPageScope } from "./wikiScope.js";
import { WikiScopeKind } from "./wikiScopeKind.js";

type MoveResetClient = Pick<
  PrismaClientType,
  "wikiPage" | "wikiPageRoleAccess"
>;

interface WikiTreePage {
  readonly id: string;
  readonly parentId: string | null;
}

interface WikiPageMoveReset {
  /** The moved page and its descendants, also the descendants in the trash */
  readonly subtreeIds: string[];
  /** For the batch of the move */
  readonly statements: Prisma.PrismaPromise<unknown>[];
}

/**
 * A moved page and its subtree take the permissions of their new place: all
 * tiers go back to inherited and the role lists are dropped. Carrying the old
 * settings over would either leak the page into its new surroundings or
 * quietly strip access from roles that cannot read the new parent — and the
 * page's own owner would keep rights the new location may not grant.
 *
 * A page moved to the top level has nothing to inherit from, so it gets the
 * defaults of a newly created top-level page: restricted, without roles and
 * owned by whoever moved it (unless it already has an explicit owner).
 */
export const buildWikiPageMoveReset = (
  prisma: MoveResetClient,
  pages: readonly WikiTreePage[],
  page: { readonly id: string; readonly ownerId: string | null },
  newParentId: string | null,
  movedById: string | null,
): WikiPageMoveReset => {
  const subtreeIds = [page.id, ...collectWikiPageDescendants(pages, page.id)];
  const descendantIds = subtreeIds.filter((id) => id !== page.id);

  const inherited = {
    visibility: WikiPageVisibility.INHERIT,
    editability: WikiPageEditability.INHERIT,
    imageUploadability: WikiPageUploadability.INHERIT,
    attachmentUploadability: WikiPageUploadability.INHERIT,
  };

  return {
    subtreeIds,
    statements: [
      prisma.wikiPage.update({
        where: { id: page.id },
        data: newParentId
          ? inherited
          : {
              visibility: WikiPageVisibility.RESTRICTED,
              editability: WikiPageEditability.RESTRICTED,
              imageUploadability: WikiPageUploadability.RESTRICTED,
              attachmentUploadability: WikiPageUploadability.RESTRICTED,
              ownerId: page.ownerId ?? movedById,
            },
        select: { id: true },
      }),
      ...(descendantIds.length > 0
        ? [
            prisma.wikiPage.updateMany({
              where: { id: { in: descendantIds } },
              data: inherited,
            }),
          ]
        : []),
      prisma.wikiPageRoleAccess.deleteMany({
        where: { pageId: { in: subtreeIds } },
      }),
    ],
  };
};

/**
 * The briefing counterpart of `buildWikiPageMoveReset()`: a moved page and
 * its subtree take the scopes and uploadability tiers of their new place.
 * Unlike the role model this is about predictability, not security — the
 * parent-read gate already bounds a child's effective access — but the move
 * dialogs promise "takes on the new parent's permissions" and both scopes
 * should keep it. A briefing has no top level to move to (the locked root is
 * its only top-level page), so there is no defaults branch.
 */
export const buildEventWikiPageMoveReset = (
  prisma: MoveResetClient,
  pages: readonly WikiTreePage[],
  pageId: string,
): WikiPageMoveReset => {
  const subtreeIds = [pageId, ...collectWikiPageDescendants(pages, pageId)];

  return {
    subtreeIds,
    statements: [
      prisma.wikiPage.updateMany({
        where: { id: { in: subtreeIds } },
        data: {
          eventReadScope: WikiPageEventScope.INHERIT,
          eventReadScopePositionId: null,
          eventEditScope: WikiPageEventScope.INHERIT,
          eventEditScopePositionId: null,
          imageUploadability: WikiPageUploadability.INHERIT,
          attachmentUploadability: WikiPageUploadability.INHERIT,
        },
      }),
    ],
  };
};

/**
 * The permission reset of a page that gets a new parent, the same on both
 * reparent paths (a move and a drop in the sidebar tree). Put the statements
 * before the update that sets the new parent: the database allows PUBLIC
 * only on a top-level page, and the reset removes PUBLIC from a page that
 * gets a parent.
 *
 * @param pageId A page of the scope
 */
export const buildWikiPageReparentReset = (
  prisma: MoveResetClient,
  scope: WikiPageScope,
  pageId: string,
  newParentId: string | null,
  updatedById: string | null,
): WikiPageMoveReset => {
  switch (scope.kind) {
    case WikiScopeKind.Wiki: {
      const page = scope.pagesById.get(pageId);
      if (!page) throw new Error("The moved page is missing from its scope");

      return buildWikiPageMoveReset(
        prisma,
        scope.allPages,
        page,
        newParentId,
        updatedById,
      );
    }

    case WikiScopeKind.Briefing:
      return buildEventWikiPageMoveReset(prisma, scope.allPages, pageId);

    default:
      throw new Error(`Unknown wiki page scope: ${scope satisfies never}`);
  }
};
