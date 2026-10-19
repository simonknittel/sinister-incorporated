import {
  getApplicationContext,
  getOptionalRequestActor,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findUnseenChangelogEntryKeys } from "@sam-monorepo/application";
import { cache } from "react";

export const getUnseenChangelogEntryKeys = cache(
  withTrace("getUnseenChangelogEntryKeys", async () => {
    const actor = await getOptionalRequestActor();
    if (!actor) return new Set<string>();

    return new Set(
      await findUnseenChangelogEntryKeys(getApplicationContext(), actor),
    );
  }),
);
