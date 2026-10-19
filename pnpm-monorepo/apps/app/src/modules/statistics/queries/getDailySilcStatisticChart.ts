import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findPositiveSilcTransactionRows,
  type PositiveSilcTransactionRow,
} from "@sam-monorepo/application";
import { getLocalDateKey, ORGANIZATION_TIMEZONE } from "@sam-monorepo/domain";
import { cache } from "react";
import { buildTotalAndDeltaChart, normalizeOptions } from "../utils/chartData";

export const getDailySilcStatisticChart = cache(
  withTrace("getDailySilcStatisticChart", async () => {
    const configuration = {};
    const options = normalizeOptions();

    let transactions: PositiveSilcTransactionRow[];
    try {
      transactions = await findPositiveSilcTransactionRows(
        getApplicationContext(),
        await getRequestActor(),
        { fromDate: options.fromDate, toDate: options.toDate },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }

    const totalsByDate = new Map<string, number>();

    for (const transaction of transactions) {
      const key = getLocalDateKey(transaction.createdAt, ORGANIZATION_TIMEZONE);
      const current = totalsByDate.get(key) ?? 0;
      totalsByDate.set(key, current + transaction.value);
    }

    const orderedTotals = options.axisPoints.map(({ key, timestamp }) => {
      const createdAt = new Date(timestamp);

      return {
        createdAt,
        count: totalsByDate.get(key) ?? 0,
      };
    });

    return buildTotalAndDeltaChart(
      orderedTotals,
      options,
      "silc",
      "SILC",
      configuration,
    );
  }),
);
