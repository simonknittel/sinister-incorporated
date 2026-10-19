import {
  getApplicationContext,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findWikiPageOwner, type WikiContext } from "@sam-monorepo/application";
import { cache } from "react";

/**
 * The effective owner of a page of the global wiki. The scope comes from
 * `getWikiContext()` of the page view, thus it belongs to the actor of the
 * request.
 */
export const getWikiPageOwner = cache(
  withTrace("getWikiPageOwner", async (scope: WikiContext, pageId: string) => {
    try {
      return await findWikiPageOwner(getApplicationContext(), scope, pageId);
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
