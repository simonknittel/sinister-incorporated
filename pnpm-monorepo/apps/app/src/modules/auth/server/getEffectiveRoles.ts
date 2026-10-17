import { prisma } from "@/db";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { getEffectiveRolesOfCitizen } from "@sam-monorepo/application";
import type { Citizen } from "@sam-monorepo/database/client";
import { cache } from "react";

export type { EffectiveRoles } from "@sam-monorepo/application";

/**
 * Loads the role assignments of a citizen one time for each request. The
 * session callback calls it first, thus the viewers of the wiki, the career
 * flows, the events, the event templates and the tasks get the same roles
 * without a query of their own.
 *
 * React `cache` keeps the result only while React renders. A server action
 * or a route handler makes a new query for each call.
 */
export const getEffectiveRoles = cache(
  withTrace("getEffectiveRoles", (citizenId: Citizen["id"]) =>
    getEffectiveRolesOfCitizen(prisma, citizenId),
  ),
);
