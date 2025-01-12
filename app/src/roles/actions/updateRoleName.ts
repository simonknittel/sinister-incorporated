"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
});

export const updateRoleName = async (
  previousState: unknown,
  formData: FormData,
) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("updateRoleName");
    await authentication.authorizeAction("role", "manage");

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
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
    const updatedRole = await prisma.role.update({
      where: {
        id: result.data.id,
      },
      data: {
        name: result.data.name,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/roles/${updatedRole.id}`);
    revalidatePath("/app/roles");

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
