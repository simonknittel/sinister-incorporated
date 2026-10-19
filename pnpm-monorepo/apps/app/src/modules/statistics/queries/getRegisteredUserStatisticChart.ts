import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findUserRegistrationRows,
  type StatisticCreationRows,
} from "@sam-monorepo/application";
import { getLocalDateKey, ORGANIZATION_TIMEZONE } from "@sam-monorepo/domain";
import { cache } from "react";
import { buildTotalAndDeltaChart, normalizeOptions } from "../utils/chartData";

export const getRegisteredUserStatisticChart = cache(
  withTrace("getRegisteredUserStatisticChart", async () => {
    const configuration = {};
    const options = normalizeOptions();

    let registrations: StatisticCreationRows<Date | null>;
    try {
      registrations = await findUserRegistrationRows(
        getApplicationContext(),
        await getRequestActor(),
        { fromDate: options.fromDate, toDate: options.toDate },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }

    const registrationsByDate = Map.groupBy(
      registrations.createdAts,
      (createdAt) =>
        createdAt ? getLocalDateKey(createdAt, ORGANIZATION_TIMEZONE) : null,
    );

    let runningTotal = registrations.baselineCount;
    const orderedTotals = options.axisPoints.map(({ key, timestamp }) => {
      const delta = registrationsByDate.get(key)?.length ?? 0;
      runningTotal += delta;

      return {
        createdAt: new Date(timestamp),
        count: runningTotal,
      };
    });

    return buildTotalAndDeltaChart(
      orderedTotals,
      options,
      "registered-users",
      "Registrierte Benutzer",
      configuration,
    );
  }),
);
