import {
  getApplicationContext,
  getOptionalRequestActor,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findNewItemIds } from "@sam-monorepo/application";
import type { ReadMarkerSubject } from "@sam-monorepo/domain";

/**
 * Of the listed items, the ones which are new for the viewer. Batched into a
 * single query, thus a list does not ask once for each row. The caller has
 * already applied the visibility and the read permission to the ids.
 */
export const getNewIds = withTrace(
  "getNewIds",
  async (
    subject: ReadMarkerSubject,
    subjectIds: string[],
  ): Promise<ReadonlySet<string>> => {
    const actor = await getOptionalRequestActor();
    if (!actor) return new Set();

    return new Set(
      await findNewItemIds(getApplicationContext(), actor, {
        subject,
        subjectIds,
      }),
    );
  },
);
