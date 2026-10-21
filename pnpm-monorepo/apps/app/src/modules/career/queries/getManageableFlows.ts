import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findManageableFlow,
  findManageableFlows,
  type FlowStatus,
  type ManageableFlowRow,
} from "@sam-monorepo/application";
import { cache } from "react";

export type ManageableFlow = ManageableFlowRow;

/** The flows of the management list (`career;manage`) */
export const getManageableFlows = cache(
  withTrace(
    "getManageableFlows",
    async (status: FlowStatus, query: string | null) => {
      try {
        return await findManageableFlows(
          getApplicationContext(),
          await getRequestActor(),
          { status, query },
        );
      } catch (error) {
        return throwApplicationErrorForPage(error);
      }
    },
  ),
);

/**
 * One flow for the management detail page, or null when it does not exist
 * (`career;manage`)
 */
export const getManageableFlow = cache(
  withTrace("getManageableFlow", async (flowId: string) => {
    try {
      return await findManageableFlow(
        getApplicationContext(),
        await getRequestActor(),
        { flowId },
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
