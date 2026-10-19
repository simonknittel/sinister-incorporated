import type { Citizen } from "@sam-monorepo/database/client";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { WikiPageAccessTier } from "./getAccessibleWikiPage.js";
import type { WikiContext } from "./wikiContext.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import { loadWikiScope, requireAccessibleWikiPage } from "./wikiScope.js";
import { WikiScopeKind } from "./wikiScopeKind.js";

/** A citizen in the header and in the details of a wiki page */
export type WikiPageCitizen = Pick<Citizen, "id" | "handle" | "deletedAt">;

const WIKI_PAGE_CITIZEN_SELECT = {
  id: true,
  handle: true,
  deletedAt: true,
} as const;

/**
 * The effective owner of the page: its own owner or the owner that it
 * inherits. A scope helper: the scope comes from a scope builder of this
 * package for the same actor.
 *
 * @throws NotFoundError when the page is not in the scope, is in the trash
 * or the actor cannot read it
 */
export const findWikiPageOwner = async (
  context: Pick<ApplicationContext, "prisma">,
  scope: WikiContext,
  pageId: string,
): Promise<WikiPageCitizen | null> => {
  requireAccessibleWikiPage(scope, pageId, WikiPageAccessTier.Read);

  const effectiveOwnerId = scope.permissions.get(pageId)?.effectiveOwnerId;
  if (!effectiveOwnerId) return null;

  return context.prisma.citizen.findUnique({
    where: { id: effectiveOwnerId },
    select: WIKI_PAGE_CITIZEN_SELECT,
  });
};

export interface WikiPageDetails {
  readonly title: string;
  readonly owner: WikiPageCitizen | null;
  /** The ancestor that gives the owner, or null for an own owner */
  readonly ownerInheritedFrom: {
    readonly id: string;
    readonly title: string;
    readonly slug: string;
  } | null;
  readonly createdBy: WikiPageCitizen | null;
  readonly createdAt: Date;
  readonly updatedBy: WikiPageCitizen | null;
  readonly updatedAt: Date;
}

/**
 * The details of a page of the global wiki for the popover in the header of
 * the page. The popover loads them when it opens: the creator and the last
 * editor are not in the wiki scope, whose read runs for all pages.
 *
 * @throws NotFoundError when the page does not exist, is in the trash or
 * the actor cannot read it
 */
export const findWikiPageDetails = async (
  context: ApplicationContext,
  actor: Actor,
  { pageId }: { readonly pageId: string },
): Promise<WikiPageDetails> => {
  const scope = await loadWikiScope(context, actor, {
    kind: WikiScopeKind.Wiki,
  });
  if (!scope) throw new NotFoundError(WikiErrorMessage.PageNotFound);

  const page = requireAccessibleWikiPage(
    scope,
    pageId,
    WikiPageAccessTier.Read,
  );
  const permissions = scope.permissions.get(page.id);
  if (!permissions) throw new NotFoundError(WikiErrorMessage.PageNotFound);

  const [authors, owner] = await Promise.all([
    context.prisma.wikiPage.findUnique({
      where: { id: page.id },
      select: {
        createdBy: { select: WIKI_PAGE_CITIZEN_SELECT },
        updatedBy: { select: WIKI_PAGE_CITIZEN_SELECT },
      },
    }),
    findWikiPageOwner(context, scope, page.id),
  ]);

  /**
   * The read access of a page is never wider than the read access of its
   * parent, thus each reader of the page can also read the ancestor that
   * gives the owner
   */
  const ownerSource =
    permissions.ownerSourceId === page.id
      ? null
      : (scope.pagesById.get(permissions.ownerSourceId) ?? null);

  return {
    title: page.title,
    owner,
    ownerInheritedFrom: ownerSource
      ? { id: ownerSource.id, title: ownerSource.title, slug: ownerSource.slug }
      : null,
    createdBy: authors?.createdBy ?? null,
    createdAt: page.createdAt,
    updatedBy: authors?.updatedBy ?? null,
    updatedAt: page.updatedAt,
  };
};
