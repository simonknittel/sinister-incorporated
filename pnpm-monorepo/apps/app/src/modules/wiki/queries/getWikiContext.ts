import { getApplicationContext, toActor } from "@/modules/application";
import { authenticate } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
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
 * context. Returns null if the viewer is unauthenticated.
 */
export const getWikiContext = cache(
  withTrace("getWikiContext", async (): Promise<WikiContext | null> => {
    const authentication = await authenticate();
    if (!authentication) return null;

    return buildWikiContext(
      getApplicationContext(),
      await toActor(authentication.session),
    );
  }),
);
