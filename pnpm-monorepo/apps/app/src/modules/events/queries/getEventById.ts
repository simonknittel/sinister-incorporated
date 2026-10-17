import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findVisibleEvent, NotFoundError } from "@sam-monorepo/application";
import type { Event } from "@sam-monorepo/database/client";
import { cache } from "react";

/**
 * One event with everything its layout and its subpages share. The position
 * tree is deliberately not part of it: only the lineup page renders it, and
 * this query sits behind the layout of all seven subpages — see
 * `getEventPositions()`.
 *
 * Not visible is indistinguishable from nonexistent: callers translate the
 * null into a 404.
 */
export const getEventById = cache(
  withTrace("getEventById", async (id: Event["id"]) => {
    try {
      return await findVisibleEvent(
        getApplicationContext(),
        await getRequestActor(),
        id,
      );
    } catch (error) {
      if (error instanceof NotFoundError) return null;

      return throwApplicationErrorForPage(error);
    }
  }),
);
