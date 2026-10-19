import { getApplicationContext } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findWikiTagPages,
  type WikiPageScope,
} from "@sam-monorepo/application";
import { cache } from "react";

/**
 * The name of a tag of the scope and its readable pages, for the tag pages
 * and their metadata. Null when the tag does not exist in the scope, or when
 * the briefing is hidden from the viewer. The scope comes from the context
 * wrapper of the page (`getWikiContext()` or `getEventWikiContext()`), thus
 * it belongs to the actor of the request.
 */
export const getWikiTagPages = cache(
  withTrace("getWikiTagPages", (scope: WikiPageScope, tagId: string) =>
    findWikiTagPages(getApplicationContext(), scope, tagId),
  ),
);
