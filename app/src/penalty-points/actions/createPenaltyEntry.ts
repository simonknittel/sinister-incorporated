"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  sinisterId: z.string().cuid(),
  points: z.coerce.number().int().min(1),
  reason: z.string().trim().max(512).optional(),
  expiresAt: z.coerce.date().optional(),
});

export const createPenaltyEntry = async (formData: FormData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("createPenaltyEntry");
    await authentication.authorizeAction("penaltyEntry", "create");
    if (!authentication.session.entityId) throw new Error("Forbidden");

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      sinisterId: formData.get("sinisterId"),
      points: formData.get("points"),
      reason: formData.has("reason") ? formData.get("reason") : undefined,
      expiresAt:
        formData.has("expiresAt") && formData.get("expiresAt") !== ""
          ? formData.get("expiresAt")
          : undefined,
    });
    if (!result.success)
      return {
        error: "Ungültige Anfrage",
        errorDetails: result.error,
      };

    /**
     * Create entry
     */
    const createdEntry = await prisma.penaltyEntry.create({
      data: {
        createdBy: {
          connect: {
            id: authentication.session.entityId,
          },
        },
        citizen: {
          connect: {
            id: result.data.sinisterId,
          },
        },
        points: result.data.points,
        reason: result.data.reason,
        expiresAt: result.data.expiresAt,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(
      `/app/spynet/citizen/${createdEntry.citizenId}/penalty-points`,
    );
    revalidatePath("/app/penalty-points");

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
    };
  }
};
