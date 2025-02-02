"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  variantId: z.string().cuid(),
  name: z.string().trim().max(255).optional(),
});

export const createShipAction = async (formData: FormData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("createShipAction");
    await authentication.authorizeAction("ship", "manage");

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      variantId: formData.get("variantId"),
      name: formData.has("name") ? formData.get("name") : undefined,
    });
    if (!result.success) {
      return {
        error: "Ungültige Anfrage",
      };
    }

    /**
     * Assign the ship to the user
     */
    await prisma.ship.create({
      data: {
        ownerId: authentication.session.user.id,
        ...result.data,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath("/app/fleet");

    /**
     * Respond with the result
     */
    return {
      success: "Das Schiff wurde erfolgreich hinzugefügt.",
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
