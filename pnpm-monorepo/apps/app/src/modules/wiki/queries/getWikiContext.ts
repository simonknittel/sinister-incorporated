import { getApplicationContext, getRequestActor } from "@/modules/application";
import {
  loadWikiScope,
  WikiScopeKind,
  type WikiContext,
} from "@sam-monorepo/application";
import { cache } from "react";

export type {
  WikiContext,
  WikiContextPage,
  WikiSharedContext,
  WikiSharedContextPage,
} from "@sam-monorepo/application";

/**
 * Loads all wiki pages and resolves the current viewer's effective
 * permissions once per request (see `loadWikiScope()`). Everything
 * wiki-related (tree, breadcrumbs, page views, actions) derives from this
 * context.
 */
export const getWikiContext = cache(async (): Promise<WikiContext | null> =>
  loadWikiScope(getApplicationContext(), await getRequestActor(), {
    kind: WikiScopeKind.Wiki,
  }),
);
