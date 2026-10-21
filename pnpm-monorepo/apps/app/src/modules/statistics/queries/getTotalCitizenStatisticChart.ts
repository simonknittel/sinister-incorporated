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
import { cache } from "react";
import { buildRunningTotalChart, normalizeOptions } from "../utils/chartData";

export const getTotalCitizenStatisticChart = cache(
  withTrace("getTotalCitizenStatisticChart", async () => {
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

    return buildRunningTotalChart(citizens, options, "citizens", "Citizens");
  }),
);
