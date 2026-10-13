import "server-only";

import { prisma } from "@/db";
import { log } from "@/modules/logging";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import type { Citizen } from "@sam-monorepo/database/client";
import { getLocalDateKey, ORGANIZATION_TIMEZONE } from "@sam-monorepo/domain";
import { unstable_rethrow } from "next/navigation";
import { cache } from "react";

/**
 * Whether today is the welcome day of the citizen: the local day of
 * `welcomedAt` in the time zone of the citizen, with the time zone of the
 * organization as the fallback. A citizen who was not welcomed yet has no
 * welcome day.
 *
 * The session callback sets `welcomedAt` before this query reads it, thus
 * the first visit of a new member already shows the welcome.
 *
 * No page must fail because of a greeting. A failed read or a time zone
 * which the runtime does not know thus yields no welcome day.
 */
export const isWelcomeDay = cache(
  withTrace(
    "isWelcomeDay",
    async (citizenId: Citizen["id"]): Promise<boolean> => {
      try {
        const citizen = await prisma.citizen.findUnique({
          where: { id: citizenId },
          select: { welcomedAt: true, timezone: true },
        });
        if (!citizen?.welcomedAt) return false;

        const timeZone = citizen.timezone ?? ORGANIZATION_TIMEZONE;

        return (
          getLocalDateKey(citizen.welcomedAt, timeZone) ===
          getLocalDateKey(new Date(), timeZone)
        );
      } catch (error) {
        unstable_rethrow(error);

        log.warn("Failed to resolve the welcome day", { citizenId, error });

        return false;
      }
    },
  ),
);
