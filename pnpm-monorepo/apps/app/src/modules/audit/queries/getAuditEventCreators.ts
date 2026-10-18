import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { listAuditEventCreators } from "@sam-monorepo/application";
import { cache } from "react";

export const getAuditEventCreators = cache(
  withTrace("getAuditEventCreators", async () => {
    try {
      return await listAuditEventCreators(
        getApplicationContext(),
        await getRequestActor(),
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
