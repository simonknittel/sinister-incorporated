import { getApplicationContext, getRequestActor } from "@/modules/application";
import { buildWikiContext, type WikiContext } from "@sam-monorepo/application";
import { cache } from "react";

export type {
  WikiContext,
  WikiContextPage,
  WikiSharedContext,
  WikiSharedContextPage,
} from "@sam-monorepo/application";

/**
 * Loads all wiki pages and resolves the current viewer's effective
 * permissions once per request (see `buildWikiContext()`). Everything
 * wiki-related (tree, breadcrumbs, page views, actions) derives from this
 * context.
 */
export const getWikiContext = cache(async (): Promise<WikiContext | null> =>
  buildWikiContext(getApplicationContext(), await getRequestActor()),
);
