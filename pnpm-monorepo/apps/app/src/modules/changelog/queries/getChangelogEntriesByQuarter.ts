import { withTrace } from "@/modules/tracing/utils/withTrace";
import { getQuarterOfDate } from "@sam-monorepo/application";
import { cache } from "react";
import { CHANGELOG_ENTRIES } from "../entries";

export const getChangelogEntriesByQuarter = cache(
  withTrace("getChangelogEntriesByQuarter", (quarterSlug: string) => {
    return CHANGELOG_ENTRIES.filter(
      (entry) => getQuarterOfDate(entry.date).slug === quarterSlug,
    );
  }),
);
