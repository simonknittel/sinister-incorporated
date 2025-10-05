"use server";

import { prisma } from "@/db";
import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getUnleashFlag } from "@/modules/common/utils/getUnleashFlag";
import { UNLEASH_FLAG } from "@/modules/common/utils/UNLEASH_FLAG";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { z } from "zod";
import { CyclePhase, getCurrentPhase } from "../utils/getCurrentPhase";

const schema = z.object({
  attribute: z.enum(["ceded", "accepted", "disbursed"]),
  cycleId: z.cuid2(),
  citizenId: z.cuid2(),
  checked: z.coerce.boolean().default(false),
});

export const updateParticipantAttribute = createAuthenticatedAction(
  "updateParticipantAttribute",
  schema,
  async (formData, authentication, data, t) => {
    if (!(await getUnleashFlag(UNLEASH_FLAG.EnableProfitDistribution)))
      notFound();

    /**
     * Authorize the request
     */
    if (!authentication.session.entity)
      return {
        error: t("Common.forbidden"),
        requestPayload: formData,
      };
    if (!(await authentication.authorize("profitDistributionCycle", "update")))
      return {
        error: t("Common.forbidden"),
        requestPayload: formData,
      };

    /**
     * Validate the request
     */
    const cycle = await prisma.profitDistributionCycle.findUnique({
      where: { id: data.cycleId },
    });
    if (!cycle)
      return {
        error: t("Common.notFound"),
        requestPayload: formData,
      };
    const currentPhase = getCurrentPhase(cycle);
    switch (data.attribute) {
      case "ceded":
        if (
          ![CyclePhase.Collection, CyclePhase.PayoutPreparation].includes(
            currentPhase,
          )
        )
          return {
            error: t("Common.badRequest"),
            requestPayload: formData,
          };
        break;

      case "accepted":
      case "disbursed":
        if (currentPhase !== CyclePhase.Payout)
          return {
            error: t("Common.badRequest"),
            requestPayload: formData,
          };
        break;

      default:
        return {
          error: t("Common.badRequest"),
          requestPayload: formData,
        };
    }

    /**
     *
     */
    await prisma.profitDistributionCycleParticipant.upsert({
      where: {
        cycleId_citizenId: {
          cycleId: data.cycleId,
          citizenId: data.citizenId,
        },
      },
      update: {
        [`${data.attribute}At`]: data.checked ? new Date() : null,
        [`${data.attribute}ById`]: authentication.session.entity.id,
      },
      create: {
        cycleId: data.cycleId,
        citizenId: data.citizenId,
        [`${data.attribute}At`]: data.checked ? new Date() : null,
        [`${data.attribute}ById`]: authentication.session.entity.id,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/profit-distribution/${cycle.id}/management`);
    revalidatePath(`/app/profit-distribution/${cycle.id}`);
    revalidatePath("/app/profit-distribution");

    return {
      success: t("Common.successfullySaved"),
    };
  },
);
