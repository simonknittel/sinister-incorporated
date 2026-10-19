import "server-only";

import { getApplicationContext } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { isWelcomeDayOfCitizen } from "@sam-monorepo/application";
import type { Citizen } from "@sam-monorepo/database/client";
import { cache } from "react";

/**
 * Whether today is the welcome day of the citizen, see
 * `isWelcomeDayOfCitizen()`.
 *
 * The session callback sets `welcomedAt` before this query reads it, thus
 * the first visit of a new member already shows the welcome.
 */
export const isWelcomeDay = cache(
  withTrace("isWelcomeDay", (citizenId: Citizen["id"]): Promise<boolean> =>
    isWelcomeDayOfCitizen(getApplicationContext(), { citizenId }),
  ),
);
