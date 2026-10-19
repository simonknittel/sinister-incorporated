import { getApplicationContext, getRequestActor } from "@/modules/application";
import {
  loadWikiScope,
  WikiScopeKind,
  type VariantWikiContext as ApplicationVariantWikiContext,
} from "@sam-monorepo/application";
import { cache } from "react";
import {
  createVariantWikiHrefMode,
  type WikiPageHrefMode,
} from "../utils/wikiPageHref";

/** The embed of a variant with the href mode of the shared wiki components */
export type VariantWikiContext = ApplicationVariantWikiContext & {
  readonly hrefMode: WikiPageHrefMode;
};

/**
 * The single gate of a variant's embedded wiki: routes, sidebar, section
 * and the scoped tRPC branches all resolve through this. Returns null when
 * the embed does not exist for the viewer (see `buildVariantWikiContext()`),
 * so callers hide the section or 404 on null without leaking why.
 */
export const getVariantWikiContext = cache(
  async (variantId: string): Promise<VariantWikiContext | null> => {
    const scope = await loadWikiScope(
      getApplicationContext(),
      await getRequestActor(),
      { kind: WikiScopeKind.Variant, variantId },
    );
    if (!scope) return null;

    return {
      ...scope,
      hrefMode: createVariantWikiHrefMode(scope.variant.id, scope.rootPage.id),
    };
  },
);
