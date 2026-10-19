import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findVariantShipCountRows,
  type VariantShipCountRow,
} from "@sam-monorepo/application";
import { cache } from "react";
import { buildChartData, normalizeOptions } from "../utils/chartData";

export const getVariantShipStatisticChart = cache(
  withTrace("getVariantShipStatisticChart", async () => {
    const configuration = {
      top: 15,
      filterEmpty: true,
    };

    const options = normalizeOptions();

    let rows: VariantShipCountRow[];
    try {
      rows = await findVariantShipCountRows(
        getApplicationContext(),
        await getRequestActor(),
        { fromDay: options.fromDateColumnValue },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }

    const records = rows.map((row) => ({
      id: row.variantId,
      name: row.variantName,
      createdAt: row.day,
      count: row.count,
    }));

    return {
      ...buildChartData(records, options, configuration),
      configuration,
    };
  }),
);
