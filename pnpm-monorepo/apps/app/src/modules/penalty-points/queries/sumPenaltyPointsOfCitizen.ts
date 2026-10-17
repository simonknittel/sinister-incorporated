import { prisma } from "@/db";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { buildActivePenaltyEntryWhere } from "@sam-monorepo/application";
import { type Citizen } from "@sam-monorepo/database/client";

/**
 * The penalty points a citizen currently holds. The caller does the
 * authorization, because the necessary permission is different for the own
 * citizen and for other citizens.
 */
export const sumPenaltyPointsOfCitizen = withTrace(
  "sumPenaltyPointsOfCitizen",
  async (citizenId: Citizen["id"]) => {
    const aggregation = await prisma.penaltyEntry.aggregate({
      where: {
        citizenId,
        ...buildActivePenaltyEntryWhere(new Date()),
      },
      _sum: {
        points: true,
      },
    });

    return aggregation._sum.points ?? 0;
  },
);
