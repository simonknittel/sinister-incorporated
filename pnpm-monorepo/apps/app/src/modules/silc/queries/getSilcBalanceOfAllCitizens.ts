import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findSilcBalanceRows } from "@sam-monorepo/application";
import { cache } from "react";

export const getSilcBalanceOfAllCitizens = cache(
  withTrace("getSilcBalanceOfAllCitizens", async () => {
    try {
      return await findSilcBalanceRows(
        getApplicationContext(),
        await getRequestActor(),
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
