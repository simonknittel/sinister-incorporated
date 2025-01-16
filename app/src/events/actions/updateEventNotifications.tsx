"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  newEvent: z.coerce.boolean().optional(),
  updatedEvent: z.coerce.boolean().optional(),
});

export const updateMyDiscordEventSubscriber = async (formData: FormData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction(
      "updateMyDiscordEventSubscriber",
    );

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      newEvent: formData.get("newEvent"),
      updatedEvent: formData.get("updatedEvent"),
    });
    if (!result.success) {
      void log.warn("Bad Request", { error: serializeError(result.error) });
      return {
        error: "Ungültige Anfrage",
      };
    }

    /**
     * Save to database
     */
    await prisma.discordEventSubscriber.upsert({
      where: {
        userId: authentication.session.user.id,
      },
      update: {
        newEvent: result.data.newEvent,
        updatedEvent: result.data.updatedEvent,
      },
      create: {
        user: {
          connect: {
            id: authentication.session.user.id,
          },
        },
        newEvent: result.data.newEvent,
        updatedEvent: result.data.updatedEvent,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath("/app");

    /**
     * Respond with the result
     */
    return {
      success: "Erfolgreich gespeichert",
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
