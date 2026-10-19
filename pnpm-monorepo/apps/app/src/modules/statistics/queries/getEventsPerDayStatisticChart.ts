import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findEventStartTimes } from "@sam-monorepo/application";
import { getLocalDateKey, ORGANIZATION_TIMEZONE } from "@sam-monorepo/domain";
import { cache } from "react";
import { buildTotalAndDeltaChart, normalizeOptions } from "../utils/chartData";

export const getEventsPerDayStatisticChart = cache(
  withTrace("getEventsPerDayStatisticChart", async () => {
    const configuration = {};
    const options = normalizeOptions();

    let startTimes: Date[];
    try {
      startTimes = await findEventStartTimes(
        getApplicationContext(),
        await getRequestActor(),
        { fromDate: options.fromDate, toDate: options.toDate },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }

    const eventsByDate = Map.groupBy(startTimes, (startTime) =>
      getLocalDateKey(startTime, ORGANIZATION_TIMEZONE),
    );

    const orderedEvents = options.axisPoints.map(({ key, timestamp }) => {
      const createdAt = new Date(timestamp);

      return {
        createdAt,
        count: eventsByDate.get(key)?.length ?? 0,
      };
    });

    return buildTotalAndDeltaChart(
      orderedEvents,
      options,
      "events",
      "Events",
      configuration,
    );
  }),
);
