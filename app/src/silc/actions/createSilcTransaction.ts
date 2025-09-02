"use server";

import { requireAuthenticationAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";
import { updateCitizensSilcBalances } from "../utils/updateCitizensSilcBalances";

const schema = z.object({
  receiverIds: z.array(z.string().trim().cuid()).min(1).max(250), // Arbitrary (untested) limit to prevent DDoS
  value: z.coerce.number().int(),
  description: z.string().trim().max(512).optional(),
});

export const createSilcTransaction = async (formData: FormData) => {
  const t = await getTranslations();

  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await requireAuthenticationAction(
      "createSilcTransaction",
    );
    await authentication.authorizeAction(
      "silcTransactionOfOtherCitizen",
      "create",
    );
    if (!authentication.session.entity)
      return {
        error: t("Common.forbidden"),
        requestPayload: formData,
      };

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      receiverIds: formData.getAll("receiverId[]"),
      value: formData.get("value"),
      description: formData.has("description")
        ? formData.get("description")
        : undefined,
    });
    if (!result.success)
      return {
        error: t("Common.badRequest"),
        errorDetails: result.error,
        requestPayload: formData,
      };

    /**
     * Create transaction
     */
    await prisma.silcTransaction.createMany({
      data: result.data.receiverIds.map((receiverId) => ({
        receiverId,
        value: result.data.value,
        description: result.data.description,
        createdById: authentication.session.entity!.id,
      })),
    });

    /**
     * Update citizens' balances
     */
    await updateCitizensSilcBalances(result.data.receiverIds);

    /**
     * Revalidate cache(s)
     */
    revalidatePath("/app/silc");
    revalidatePath("/app/silc/transactions");
    revalidatePath("/app/dashboard");

    /**
     * Respond with the result
     */
    return {
      success: "Erfolgreich gespeichert.",
    };
  } catch (error) {
    unstable_rethrow(error);
    void log.error("Internal Server Error", { error: serializeError(error) });
    return {
      error: t("Common.internalServerError"),
      requestPayload: formData,
    };
  }
};
