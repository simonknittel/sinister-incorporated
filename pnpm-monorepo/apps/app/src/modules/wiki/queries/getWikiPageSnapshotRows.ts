import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findWikiPageSnapshotRows } from "@sam-monorepo/application";
import { cache } from "react";

/** The snapshots of a page, the newest first. Only for its administrators. */
export const getWikiPageSnapshotRows = cache(
  withTrace("getWikiPageSnapshotRows", async (pageId: string) => {
    try {
      return await findWikiPageSnapshotRows(
        getApplicationContext(),
        await getRequestActor(),
        { pageId },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
