import type { Variant } from "@sam-monorepo/database/client";
import {
  collectWikiPageDescendants,
  type ResolvedWikiPagePermissions,
  type WikiPageViewer,
} from "@sam-monorepo/domain";
import type { WikiPageHrefBase } from "@sam-monorepo/wiki-editor/helpers";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { canViewVariantPages } from "../fleet/variantPageAccess.js";
import { withSpan } from "../withSpan.js";
import {
  getAccessibleWikiPage,
  WikiPageAccessTier,
} from "./getAccessibleWikiPage.js";
import {
  buildWikiContext,
  type WikiContext,
  type WikiContextPage,
} from "./wikiContext.js";
import { createVariantWikiHrefBase } from "./wikiPagePath.js";
import { WikiScopeKind } from "./wikiScopeKind.js";

/**
 * The subtree of the global wiki that a fleet variant embeds: one of the
 * wiki scopes (see `wikiScope.ts`). Structurally a `WikiSharedContext`
 * (pages/pagesById/permissions), so the shared tree/breadcrumb/target/search
 * utilities work on the slice with the embed's semantics: the ancestor walks
 * dead-end at the linked root (its parent is outside the sliced map), page
 * lookups miss for out-of-subtree ids, and `buildVisibleWikiTree`
 * re-parents the root to the top level. The permission map is deliberately
 * the global superset — every lookup goes through `pagesById` first, so it
 * never widens the slice.
 */
export interface VariantWikiContext {
  readonly kind: WikiScopeKind.Variant;
  /** The routes of the pages */
  readonly hrefBase: WikiPageHrefBase;
  variant: Pick<Variant, "id" | "name">;
  /** The global context the slice derives from, e.g. for page content */
  globalContext: WikiContext;
  viewer: WikiPageViewer;
  /** The linked page, readable by the viewer — the embed's locked root */
  rootPage: WikiContextPage;
  /** The root and its not-deleted descendants */
  subtreePageIds: ReadonlySet<string>;
  /** Not-deleted pages of the subtree, in global context order */
  pages: WikiContextPage[];
  pagesById: Map<string, WikiContextPage>;
  permissions: Map<string, ResolvedWikiPagePermissions>;
}

/**
 * The single gate of a variant's embedded wiki. Returns null when the actor
 * fails the fleet gate of the variant page, the variant is unknown or
 * unlinked, or the linked page is trashed or not readable — "a context
 * exists" is exactly "the embed exists", so callers hide the section or 404
 * on null without leaking why.
 */
export const buildVariantWikiContext = (
  context: ApplicationContext,
  actor: Actor,
  variantId: string,
): Promise<VariantWikiContext | null> =>
  withSpan(context, "buildVariantWikiContext", async () => {
    if (!canViewVariantPages(actor)) return null;

    const variant = await context.prisma.variant.findUnique({
      where: { id: variantId },
      select: { id: true, name: true, wikiPageId: true },
    });
    if (!variant?.wikiPageId) return null;

    const globalContext = await buildWikiContext(context, actor);
    const rootPage = getAccessibleWikiPage(
      globalContext,
      variant.wikiPageId,
      WikiPageAccessTier.Read,
    );
    if (!rootPage) return null;

    const subtreePageIds = new Set([
      rootPage.id,
      ...collectWikiPageDescendants(globalContext.pages, rootPage.id),
    ]);
    const pages = globalContext.pages.filter((page) =>
      subtreePageIds.has(page.id),
    );

    return {
      kind: WikiScopeKind.Variant,
      hrefBase: createVariantWikiHrefBase(variant.id, rootPage.id),
      variant: { id: variant.id, name: variant.name },
      globalContext,
      viewer: globalContext.viewer,
      rootPage,
      subtreePageIds,
      pages,
      pagesById: new Map(pages.map((page) => [page.id, page])),
      permissions: globalContext.permissions,
    };
  });
