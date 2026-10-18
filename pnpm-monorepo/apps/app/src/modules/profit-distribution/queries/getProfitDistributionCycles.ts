import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import {
  findProfitDistributionCycleExcerpts,
  ProfitDistributionCycleListStatus,
} from "@sam-monorepo/application";
import { cache } from "react";

/**
 * The cycles of the list (see `findProfitDistributionCycleExcerpts` of the
 * application package). Each status other than "open" gives the completed
 * cycles.
 */
export const getProfitDistributionCycles = cache(async (status = "open") => {
  try {
    return await findProfitDistributionCycleExcerpts(
      getApplicationContext(),
      await getRequestActor(),
      {
        status:
          status === "open"
            ? ProfitDistributionCycleListStatus.Open
            : ProfitDistributionCycleListStatus.Completed,
      },
    );
  } catch (error) {
    return throwApplicationErrorForPage(error);
  }
});
