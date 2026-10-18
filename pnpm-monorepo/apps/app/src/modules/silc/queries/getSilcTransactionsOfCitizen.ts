import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findCitizenSilcTransactionRows } from "@sam-monorepo/application";
import type { Citizen } from "@sam-monorepo/database/client";
import { cache } from "react";

export const getSilcTransactionsOfCitizen = cache(
  withTrace(
    "getSilcTransactionsOfCitizen",
    async (citizenId: Citizen["id"]) => {
      try {
        return await findCitizenSilcTransactionRows(
          getApplicationContext(),
          await getRequestActor(),
          citizenId,
        );
      } catch (error) {
        return throwApplicationErrorForPage(error);
      }
    },
  ),
);
