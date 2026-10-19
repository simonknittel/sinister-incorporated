import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findOrganizationCreationRows,
  type StatisticCreationRows,
} from "@sam-monorepo/application";
import { getLocalDateKey, ORGANIZATION_TIMEZONE } from "@sam-monorepo/domain";
import { cache } from "react";
import { buildTotalAndDeltaChart, normalizeOptions } from "../utils/chartData";

export const getTotalOrganizationStatisticChart = cache(
  withTrace("getTotalOrganizationStatisticChart", async () => {
    const configuration = {};
    const options = normalizeOptions();

    let organizations: StatisticCreationRows<Date>;
    try {
      organizations = await findOrganizationCreationRows(
        getApplicationContext(),
        await getRequestActor(),
        { fromDate: options.fromDate, toDate: options.toDate },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }

    const organizationsByDate = Map.groupBy(
      organizations.createdAts,
      (createdAt) => getLocalDateKey(createdAt, ORGANIZATION_TIMEZONE),
    );

    let runningTotal = organizations.baselineCount;
    const orderedTotals = options.axisPoints.map(({ key, timestamp }) => {
      const delta = organizationsByDate.get(key)?.length ?? 0;
      runningTotal += delta;

      return {
        createdAt: new Date(timestamp),
        count: runningTotal,
      };
    });

    return buildTotalAndDeltaChart(
      orderedTotals,
      options,
      "organizations",
      "Organisationen",
      configuration,
    );
  }),
);
