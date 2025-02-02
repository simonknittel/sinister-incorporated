"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  userId: z.string().cuid(),
});

export const verifyEmailAction = async (formData: FormData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("verifyEmail");
    await authentication.authorizeAction("user", "manage");

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      userId: formData.get("userId"),
    });
    if (!result.success) {
      return {
        error: "Ungültige Anfrage",
      };
    }

    /**
     * Verify the email address
     */
    await prisma.$transaction([
      prisma.emailConfirmationToken.deleteMany({
        where: {
          userId: result.data.userId,
        },
      }),

      prisma.user.update({
        where: {
          id: result.data.userId,
        },
        data: {
          emailVerified: new Date(),
        },
      }),
    ]);

    /**
     * Revalidate cache(s)
     */
    revalidatePath("/app/users");

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
