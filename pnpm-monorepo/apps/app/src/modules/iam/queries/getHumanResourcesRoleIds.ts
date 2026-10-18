import { getApplicationContext } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { getHumanResourcesRoleIds as getHumanResourcesRoleIdsUseCase } from "@sam-monorepo/application";
import { cache } from "react";

/**
 * The ids of the roles that count as Human Resources. No permission check:
 * the clearance page calls it for a user without permissions.
 */
export const getHumanResourcesRoleIds = cache(
  withTrace("getHumanResourcesRoleIds", () =>
    getHumanResourcesRoleIdsUseCase(getApplicationContext()),
  ),
);
