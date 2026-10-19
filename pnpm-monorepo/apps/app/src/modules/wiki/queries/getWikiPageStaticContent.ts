import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { findWikiPageContent, type WikiScope } from "@sam-monorepo/application";
import { cache } from "react";

export type { WikiPageStaticContent } from "@sam-monorepo/application";

/**
 * All that the static render of the content of a page (and the collab
 * editor, which renders the same nodes) needs for the viewer. The scope
 * comes from the context wrapper of the page view (for example
 * `getWikiContext()`), thus it belongs to the actor of the request.
 */
export const getWikiPageStaticContent = cache(
  async (scope: WikiScope, pageId: string) => {
    try {
      return await findWikiPageContent(
        getApplicationContext(),
        await getRequestActor(),
        scope,
        pageId,
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  },
);
