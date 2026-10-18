import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findRoleSalaryRows } from "@sam-monorepo/application";
import { cache } from "react";

export const getRoleSalaries = cache(
  withTrace("getRoleSalaries", async () => {
    try {
      return await findRoleSalaryRows(
        getApplicationContext(),
        await getRequestActor(),
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
