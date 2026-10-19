import {
  getApplicationContext,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findWikiPageTags, type WikiScope } from "@sam-monorepo/application";
import { cache } from "react";

/**
 * The tags of a page, by name. The scope comes from the context wrapper of
 * the page view (for example `getWikiContext()`), thus it belongs to the
 * actor of the request.
 */
export const getWikiPageTags = cache(
  withTrace("getWikiPageTags", async (scope: WikiScope, pageId: string) => {
    try {
      return await findWikiPageTags(getApplicationContext(), scope, pageId);
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
