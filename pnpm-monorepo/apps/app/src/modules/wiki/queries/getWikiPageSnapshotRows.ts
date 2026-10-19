import {
  getApplicationContext,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findWikiPageSnapshotRows,
  type WikiScope,
} from "@sam-monorepo/application";
import { cache } from "react";

/**
 * The snapshots of a page, the newest first. Only for its administrators.
 * The scope comes from the context wrapper of the page, thus it belongs to
 * the actor of the request.
 */
export const getWikiPageSnapshotRows = cache(
  withTrace(
    "getWikiPageSnapshotRows",
    async (scope: WikiScope, pageId: string) => {
      try {
        return await findWikiPageSnapshotRows(
          getApplicationContext(),
          scope,
          pageId,
        );
      } catch (error) {
        return throwApplicationErrorForPage(error);
      }
    },
  ),
);
