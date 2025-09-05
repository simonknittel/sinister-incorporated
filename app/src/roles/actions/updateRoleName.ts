"use server";

import { requireAuthenticationAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  id: z.cuid(),
  name: z.string().min(1).max(255),
});

export const updateRoleName = async (
  previousState: unknown,
  formData: FormData,
) => {
  const t = await getTranslations();

  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await requireAuthenticationAction("updateRoleName");
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
        error: t("Common.badRequest"),
        requestPayload: formData,
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
    revalidatePath("/app/iam/roles");

    /**
     * Respond with the result
     */
    return {
      success: t("Common.successfullySaved"),
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
