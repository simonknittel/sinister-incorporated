import {
  getApplicationContext,
  throwApplicationErrorForPage,
  toActor,
} from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { listActiveOrganizationMemberships } from "@sam-monorepo/application";
import type { Organization } from "@sam-monorepo/database/client";

/** The current members of the organization that the viewer can see */
export const getActiveOrganizationMemberships = withTrace(
  "getActiveOrganizationMemberships",
  async (id: Organization["id"]) => {
    const { session } = await requireAuthentication();

    try {
      return await listActiveOrganizationMemberships(
        getApplicationContext(),
        await toActor(session),
        id,
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  },
);
