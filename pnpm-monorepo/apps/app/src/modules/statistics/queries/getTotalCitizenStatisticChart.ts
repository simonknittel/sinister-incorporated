import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findCitizenCreationRows,
  type StatisticCreationRows,
} from "@sam-monorepo/application";
import { getLocalDateKey, ORGANIZATION_TIMEZONE } from "@sam-monorepo/domain";
import { cache } from "react";
import { buildTotalAndDeltaChart, normalizeOptions } from "../utils/chartData";

export const getTotalCitizenStatisticChart = cache(
  withTrace("getTotalCitizenStatisticChart", async () => {
    const configuration = {};
    const options = normalizeOptions();

    let citizens: StatisticCreationRows<Date>;
    try {
      citizens = await findCitizenCreationRows(
        getApplicationContext(),
        await getRequestActor(),
        { fromDate: options.fromDate, toDate: options.toDate },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }

    const citizensByDate = Map.groupBy(citizens.createdAts, (createdAt) =>
      getLocalDateKey(createdAt, ORGANIZATION_TIMEZONE),
    );

    let runningTotal = citizens.baselineCount;
    const orderedTotals = options.axisPoints.map(({ key, timestamp }) => {
      const delta = citizensByDate.get(key)?.length ?? 0;
      runningTotal += delta;

      return {
        createdAt: new Date(timestamp),
        count: runningTotal,
      };
    });

    return buildTotalAndDeltaChart(
      orderedTotals,
      options,
      "citizens",
      "Citizens",
      configuration,
    );
  }),
);
