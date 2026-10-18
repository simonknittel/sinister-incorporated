import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findOwnOpenTaskRows } from "@sam-monorepo/application";
import { cache } from "react";

export const getMyAssignedTasks = cache(
  withTrace("getMyAssignedTasks", async () => {
    try {
      return await findOwnOpenTaskRows(
        getApplicationContext(),
        await getRequestActor(),
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
