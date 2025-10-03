"use server";

import { prisma } from "@/db";
import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getUnleashFlag } from "@/modules/common/utils/getUnleashFlag";
import { UNLEASH_FLAG } from "@/modules/common/utils/UNLEASH_FLAG";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { z } from "zod";
import { updateCitizensSilcBalances } from "../utils/updateCitizensSilcBalances";

const schema = z.object({
  id: z.cuid2(),
});

export const endCollectionPhase = createAuthenticatedAction(
  "endCollectionPhase",
  schema,
  async (formData, authentication, data, t) => {
    if (!(await getUnleashFlag(UNLEASH_FLAG.EnableProfitDistribution)))
      notFound();

    /**
     * Authorize the request
     */
    if (!(await authentication.authorize("profitDistributionCycle", "update")))
      return {
        error: t("Common.forbidden"),
        requestPayload: formData,
      };

    /**
     * Validate the request
     */
    const cycle = await prisma.profitDistributionCycle.findUnique({
      where: { id: data.id },
    });
    if (!cycle)
      return {
        error: t("Common.notFound"),
        requestPayload: formData,
      };

    /**
     *
     */
    const allSilcBalances = await prisma.entity.findMany({
      where: {
        silcBalance: {
          gt: 0,
        },
      },
    });

    await prisma.$transaction([
      prisma.profitDistributionCycle.update({
        where: {
          id: data.id,
        },
        data: {
          collectionEndedAt: new Date(),
          collectionEndedById: authentication.session.entity?.id,
        },
      }),

      ...allSilcBalances.map((entity) =>
        prisma.profitDistributionCycleParticipant.upsert({
          where: {
            cycleId_citizenId: {
              cycleId: data.id,
              citizenId: entity.id,
            },
          },
          update: {
            silcBalanceSnapshot: entity.silcBalance,
          },
          create: {
            cycleId: data.id,
            citizenId: entity.id,
            silcBalanceSnapshot: entity.silcBalance,
          },
        }),
      ),

      prisma.silcTransaction.createMany({
        data: allSilcBalances.map((citizen) => ({
          receiverId: citizen.id,
          value: -citizen.silcBalance,
          description: `Gewinnverteilung: ${cycle.title}`,
          createdById: authentication.session.entity!.id,
        })),
      }),
    ]);

    await updateCitizensSilcBalances(
      allSilcBalances.map((citizen) => citizen.id),
    );

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/silc/profit-distribution/${data.id}/management`);
    revalidatePath(`/app/silc/profit-distribution/${data.id}`);
    revalidatePath("/app/silc/profit-distribution");

    return {
      success: t("Common.successfullySaved"),
    };
  },
);
