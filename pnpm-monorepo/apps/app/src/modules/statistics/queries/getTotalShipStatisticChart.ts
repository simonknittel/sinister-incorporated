import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findTotalShipCountRows,
  type TotalShipCountRow,
} from "@sam-monorepo/application";
import { cache } from "react";
import { buildTotalAndDeltaChart, normalizeOptions } from "../utils/chartData";

export const getTotalShipStatisticChart = cache(
  withTrace("getTotalShipStatisticChart", async () => {
    const options = normalizeOptions();

    let rows: TotalShipCountRow[];
    try {
      rows = await findTotalShipCountRows(
        getApplicationContext(),
        await getRequestActor(),
        { fromDay: options.fromDateColumnValue },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }

    const orderedTotals = rows.map((row) => ({
      createdAt: row.day,
      count: row.count,
    }));

    const configuration = {};

    return buildTotalAndDeltaChart(
      orderedTotals,
      options,
      "total-ships",
      "Gesamt",
      configuration,
    );
  }),
);
