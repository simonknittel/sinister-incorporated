import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { findProfitDistributionCycleDetails } from "@sam-monorepo/application";
import type { ProfitDistributionCycle } from "@sam-monorepo/database/client";
import { cache } from "react";

/**
 * The cycle of the page and of the management page (see
 * `findProfitDistributionCycleDetails` of the application package), or null
 * when it does not exist
 */
export const getProfitDistributionCycleById = cache(
  async (id: ProfitDistributionCycle["id"]) => {
    try {
      return await findProfitDistributionCycleDetails(
        getApplicationContext(),
        await getRequestActor(),
        id,
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  },
);
