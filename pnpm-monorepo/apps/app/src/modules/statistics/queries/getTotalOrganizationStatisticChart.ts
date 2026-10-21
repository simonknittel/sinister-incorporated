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
import { cache } from "react";
import { buildRunningTotalChart, normalizeOptions } from "../utils/chartData";

export const getTotalOrganizationStatisticChart = cache(
  withTrace("getTotalOrganizationStatisticChart", async () => {
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

    return buildRunningTotalChart(
      organizations,
      options,
      "organizations",
      "Organisationen",
    );
  }),
);
