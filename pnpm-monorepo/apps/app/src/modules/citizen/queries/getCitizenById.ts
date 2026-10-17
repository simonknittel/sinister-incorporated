import { prisma } from "@/db";
import {
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { requireCitizenReadAccess } from "@sam-monorepo/application";
import type { Citizen } from "@sam-monorepo/database/client";
import { ACTIVE_CITIZEN_WHERE } from "@sam-monorepo/domain";
import { cache } from "react";

/**
 * The citizen of the Spynet pages. The pages hide the values that the viewer
 * cannot read; the MCP server reads a citizen with the `getCitizen` use
 * case.
 */
export const getCitizenById = cache(
  withTrace("getCitizenById", async (id: Citizen["id"]) => {
    try {
      requireCitizenReadAccess(await getRequestActor(), id);
    } catch (error) {
      throwApplicationErrorForPage(error);
    }

    /**
     * The identity columns hold the content of the latest confirmed log entry
     * of their type. The overview shows them; their history stays behind the
     * history modal, which reads the logs with its own query.
     */
    return prisma.citizen.findFirst({
      where: {
        id,
        ...ACTIVE_CITIZEN_WHERE,
      },
      select: {
        id: true,
        handle: true,
        spectrumId: true,
        discordId: true,
        teamspeakId: true,
        citizenRecord: true,
        userId: true,
        communityMoniker: true,
        timezone: true,
        birthdayDay: true,
        birthdayMonth: true,
        roleAssignments: {
          select: {
            roleId: true,
            currentLevel: true,
          },
        },
      },
    });
  }),
);
