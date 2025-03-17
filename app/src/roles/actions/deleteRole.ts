"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { redirect, unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  id: z.string().cuid(),
});

export const deleteRole = async (
  previousState: unknown,
  formData: FormData,
) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("deleteRole");
    await authentication.authorizeAction("role", "manage");

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      id: formData.get("id"),
    });
    if (!result.success) {
      void log.warn("Bad Request", { error: serializeError(result.error) });
      return {
        error: "Ungültige Anfrage",
      };
    }

    /**
     * Update role
     */
    await prisma.$transaction([
      prisma.role.delete({
        where: {
          id: result.data.id,
        },
      }),

      prisma.permissionString.deleteMany({
        where: {
          permissionString: {
            contains: result.data.id,
          },
        },
      }),
    ]);

    /**
     * Redirect
     */
    redirect("/app/roles");
  } catch (error) {
    unstable_rethrow(error);
    void log.error("Internal Server Error", { error: serializeError(error) });
    return {
      error:
        "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
    };
  }
};
