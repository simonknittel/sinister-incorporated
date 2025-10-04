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
  participantId: z.cuid2(),
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
    const participant =
      await prisma.profitDistributionCycleParticipant.findUnique({
        where: { id: data.participantId },
        include: { cycle: true },
      });
    if (!participant)
      return {
        error: t("Common.notFound"),
        requestPayload: formData,
      };
    const currentPhase = getCurrentPhase(participant.cycle);
    switch (data.attribute) {
      case "ceded":
        if (currentPhase !== CyclePhase.Collection)
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
    await prisma.profitDistributionCycleParticipant.update({
      where: { id: participant.id },
      data: {
        [`${data.attribute}At`]: data.checked ? new Date() : null,
        [`${data.attribute}ById`]: authentication.session.entity.id,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(
      `/app/silc/profit-distribution/${participant.cycleId}/management`,
    );
    revalidatePath(`/app/silc/profit-distribution/${participant.cycleId}`);
    revalidatePath("/app/silc/profit-distribution");

    return {
      success: t("Common.successfullySaved"),
    };
  },
);
