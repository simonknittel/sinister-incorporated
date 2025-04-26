"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";
import { updateCitizensSilcBalances } from "../utils/updateCitizensSilcBalances";

const schema = z.object({
  receiverIds: z.array(z.string().trim().cuid()).min(1),
  value: z.coerce.number().int(),
  description: z.string().trim().max(512).optional(),
});

export const createSilcTransaction = async (formData: FormData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("createSilcTransaction");
    await authentication.authorizeAction(
      "silcTransactionOfOtherCitizen",
      "create",
    );
    if (!authentication.session.entity)
      return {
        error: "Du bist nicht berechtigt, diese Aktion durchzuführen.",
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
        error: "Ungültige Anfrage",
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
      error:
        "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
      requestPayload: formData,
    };
  }
};
