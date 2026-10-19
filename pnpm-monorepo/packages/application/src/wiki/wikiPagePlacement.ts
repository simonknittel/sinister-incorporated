import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../errors.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import {
  loadWikiScope,
  loadWikiScopeOfPage,
  type WikiPageScope,
} from "./wikiScope.js";
import { WikiScopeKind } from "./wikiScopeKind.js";

export enum WikiPagePlacement {
  Allowed = "allowed",
  /** No such page, or it is in the trash */
  Missing = "missing",
  /** The page exists, but the viewer does not manage it */
  Forbidden = "forbidden",
}

interface WikiPagePlacementContext {
  readonly pagesById: ReadonlyMap<string, { readonly deletedAt: Date | null }>;
  readonly permissions: ReadonlyMap<string, { readonly canAdmin: boolean }>;
}

/**
 * Whether the viewer may hang a page — a new, a copied or a moved one —
 * underneath the given page. This takes managing the target, not editing it:
 * editing means changing that page's own content, while adding pages below it
 * decides what the subtree contains and who reaches it. Were edit access
 * enough, whoever may edit a single page could pull every page they can read
 * underneath it, where it would then take on that page's permissions.
 *
 * Placing at the top level has no target page and is gated by the global
 * `wiki;create` permission instead; callers handle that case, and the error
 * message per result, themselves.
 */
export const resolveWikiPagePlacement = (
  context: WikiPagePlacementContext,
  parentId: string,
): WikiPagePlacement => {
  const parent = context.pagesById.get(parentId);
  if (!parent || parent.deletedAt) return WikiPagePlacement.Missing;
  if (!context.permissions.get(parentId)?.canAdmin)
    return WikiPagePlacement.Forbidden;
  return WikiPagePlacement.Allowed;
};

/**
 * Whether the actor can add a page below the page: the rule of
 * `requireWikiPagePlacement()` for a parent
 *
 * @param frozen True for the briefing of an event that is over
 */
export const canAddWikiChildren = (
  context: WikiPagePlacementContext,
  pageId: string,
  frozen: boolean,
) =>
  !frozen &&
  resolveWikiPagePlacement(context, pageId) === WikiPagePlacement.Allowed;

/** A page of the scope as the creation of a page below it needs it */
export interface WikiPlacementPage {
  readonly id: string;
  readonly parentId: string | null;
  readonly sortOrder: number;
  readonly eventId: string | null;
  readonly templateId: string | null;
  readonly deletedAt: Date | null;
}

/**
 * The scope of a new page: the global wiki, the briefing of an event or the
 * briefing of an event template, with the permissions of the actor. The
 * scopes of `wikiScope.ts` agree with it.
 */
export interface WikiPlacementScope {
  /** Pages that are not in the trash */
  readonly pages: readonly WikiPlacementPage[];
  /** All pages, also the pages in the trash */
  readonly pagesById: ReadonlyMap<string, WikiPlacementPage>;
  readonly permissions: ReadonlyMap<string, { readonly canAdmin: boolean }>;
  /** True for the briefing of an event that is over: it refuses all changes */
  readonly frozen?: boolean;
}

/**
 * Checks that the actor can add a page below the parent, or at the top of
 * the global wiki without a parent. Gives the scope back, thus the caller
 * knows that it exists.
 *
 * @param scope The scope of the parent, or the global wiki without a parent.
 * Null when the actor cannot hold it.
 * @throws NotFoundError when the scope or the parent does not exist for the
 * actor, or when the parent is in the trash
 * @throws ForbiddenError when the actor does not manage the parent, or when
 * the actor cannot create a page at the top (`wiki;create`)
 * @throws ConflictError when the event of the briefing is over
 */
export const requireWikiPagePlacement = <Scope extends WikiPlacementScope>(
  actor: Actor,
  scope: Scope | null,
  parentId: string | undefined,
): Scope => {
  if (!scope) throw new NotFoundError(WikiErrorMessage.ParentPageNotFound);

  if (parentId === undefined) {
    requirePermission(actor, "wiki", "create");
    return scope;
  }

  const placement = resolveWikiPagePlacement(scope, parentId);
  switch (placement) {
    case WikiPagePlacement.Missing:
      throw new NotFoundError(WikiErrorMessage.ParentPageNotFound);

    case WikiPagePlacement.Forbidden:
      throw new ForbiddenError("The user does not manage the parent page");

    case WikiPagePlacement.Allowed:
      break;

    default:
      throw new Error(
        `Unknown wiki page placement: ${placement satisfies never}`,
      );
  }

  if (scope.frozen) throw new ConflictError(WikiErrorMessage.BriefingFrozen);

  return scope;
};

/**
 * The scope of the parent, or the global wiki without a parent. A briefing
 * has only one top-level page (its root), thus a page without a parent goes
 * to the global wiki.
 */
export const loadWikiScopeOfParent = (
  context: ApplicationContext,
  actor: Actor,
  parentId: string | undefined,
): Promise<WikiPageScope | null> =>
  parentId === undefined
    ? loadWikiScope(context, actor, { kind: WikiScopeKind.Wiki })
    : loadWikiScopeOfPage(context, actor, parentId);
