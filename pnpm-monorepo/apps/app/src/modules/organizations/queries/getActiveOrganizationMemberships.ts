import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { listActiveOrganizationMemberships } from "@sam-monorepo/application";
import type { Organization } from "@sam-monorepo/database/client";

/** The current members of the organization that the viewer can see */
export const getActiveOrganizationMemberships = withTrace(
  "getActiveOrganizationMemberships",
  async (id: Organization["id"]) => {
    try {
      return await listActiveOrganizationMemberships(
        getApplicationContext(),
        await getRequestActor(),
        id,
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  },
);
