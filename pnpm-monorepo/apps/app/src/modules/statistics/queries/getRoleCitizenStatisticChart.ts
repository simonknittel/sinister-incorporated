import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findRoleCitizenCountRows,
  type RoleCitizenCountRow,
} from "@sam-monorepo/application";
import { cache } from "react";
import { buildChartData, normalizeOptions } from "../utils/chartData";

export const getRoleCitizenStatisticChart = cache(
  withTrace("getRoleCitizenStatisticChart", async () => {
    const configuration = {
      top: 15,
      filterEmpty: true,
    };

    const options = normalizeOptions();

    let rows: RoleCitizenCountRow[];
    try {
      rows = await findRoleCitizenCountRows(
        getApplicationContext(),
        await getRequestActor(),
        { fromDay: options.fromDateColumnValue },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }

    const records = rows.map((row) => ({
      id: row.roleId,
      name: row.roleName,
      createdAt: row.day,
      count: row.count,
    }));

    return {
      ...buildChartData(records, options, configuration),
      configuration,
    };
  }),
);
