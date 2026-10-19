import { getApplicationContext, getRequestActor } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findOwnRecentWikiPageIds,
  findOwnWikiFavoritePageIds,
} from "@sam-monorepo/application";
import { cache } from "react";

/**
 * Ids of the viewer's favorite pages. Unfiltered — callers apply visibility
 * via their wiki context so a page that became invisible simply drops out
 * of the lists (the favorite row is kept in case access returns). Only the
 * viewer's identity is needed here, so no context is loaded — the event
 * sidebar calls this without ever touching the global context.
 */
export const getWikiFavoritePageIds = cache(
  withTrace(
    "getWikiFavoritePageIds",
    async (): Promise<Set<string>> =>
      new Set(
        await findOwnWikiFavoritePageIds(
          getApplicationContext(),
          await getRequestActor(),
        ),
      ),
  ),
);

/**
 * Ids of the viewer's most recently visited pages, newest first.
 * Unfiltered like the favorites above.
 */
export const getWikiRecentVisitPageIds = cache(
  withTrace("getWikiRecentVisitPageIds", async (): Promise<string[]> =>
    findOwnRecentWikiPageIds(getApplicationContext(), await getRequestActor()),
  ),
);
