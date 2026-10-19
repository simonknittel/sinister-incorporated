import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findDailyLoginCountRows,
  type DailyLoginCountRow,
} from "@sam-monorepo/application";
import { cache } from "react";
import { buildTotalAndDeltaChart, normalizeOptions } from "../utils/chartData";

export const getDailyLoginStatisticChart = cache(
  withTrace("getDailyLoginStatisticChart", async () => {
    const configuration = {};
    const options = normalizeOptions();

    let rows: DailyLoginCountRow[];
    try {
      rows = await findDailyLoginCountRows(
        getApplicationContext(),
        await getRequestActor(),
        { fromDay: options.fromDateColumnValue },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }

    const orderedLogins = rows.map((row) => ({
      createdAt: row.date,
      count: row.count,
    }));

    return buildTotalAndDeltaChart(
      orderedLogins,
      options,
      "logins",
      "Logins",
      configuration,
    );
  }),
);
