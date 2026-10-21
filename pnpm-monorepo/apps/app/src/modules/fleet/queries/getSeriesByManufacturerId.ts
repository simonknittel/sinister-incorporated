import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findManufacturerSeriesRows } from "@sam-monorepo/application";
import { cache } from "react";

/** See `findManufacturerSeriesRows()` */
export const getSeriesByManufacturerId = cache(
  withTrace("getSeriesByManufacturerId", async (manufacturerId: string) => {
    try {
      return await findManufacturerSeriesRows(
        getApplicationContext(),
        await getRequestActor(),
        { manufacturerId },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
