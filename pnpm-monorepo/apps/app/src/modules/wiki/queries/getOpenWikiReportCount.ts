import { getApplicationContext, getRequestActor } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { countOpenWikiReports } from "@sam-monorepo/application";
import { cache } from "react";

/**
 * The number of the reports that are not resolved, for the badge of the
 * wiki tile and the navigation entry "Meldungen". 0 without `wiki;manage`.
 */
export const getOpenWikiReportCount = cache(
  withTrace("getOpenWikiReportCount", async () =>
    countOpenWikiReports(getApplicationContext(), await getRequestActor()),
  ),
);
