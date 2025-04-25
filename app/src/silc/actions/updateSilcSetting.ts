"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { SilcSettingKey } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  key: z.literal(SilcSettingKey.AUEC_CONVERSION_RATE),
  value: z.coerce
    .number()
    .min(1)
    .transform((value) => value.toString()),
});

export const updateSilcSetting = async (
  previousState: unknown,
  formData: FormData,
) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("updateSilcSetting");
    await authentication.authorizeAction("silcSetting", "update");
    if (!authentication.session.entity)
      return { error: "Du bist nicht berechtigt, diese Aktion durchzuführen." };

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      key: formData.get("key"),
      value: formData.get("value"),
    });
    if (!result.success) {
      void log.warn("Invalid Zod schema", {
        error: serializeError(result.error),
      });
      return {
        error: "Ungültige Anfrage",
        errorDetails: result.error,
      };
    }

    /**
     * Update setting
     */
    await prisma.silcSetting.upsert({
      where: {
        key: result.data.key,
      },
      update: {
        value: result.data.value,
        updatedBy: {
          connect: {
            id: authentication.session.entity.id,
          },
        },
      },
      create: {
        key: result.data.key,
        value: result.data.value,
        updatedBy: {
          connect: {
            id: authentication.session.entity.id,
          },
        },
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/silc/settings`);
    revalidatePath("/app/silc");

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
