import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findManagedRole } from "@sam-monorepo/application";
import { cache } from "react";

/**
 * The role of the role pages, or null when it does not exist. Requires
 * `role;manage`.
 */
export const getRoleById = cache(
  withTrace("getRoleById", async (id: string) => {
    try {
      return await findManagedRole(
        getApplicationContext(),
        await getRequestActor(),
        id,
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
