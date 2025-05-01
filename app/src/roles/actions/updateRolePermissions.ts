"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  id: z.string().cuid(),
  permissionStrings: z.array(
    z
      .string()
      .trim()
      .min(1)
      .regex(/^[\w\-]+;[\w\-]+(?:;[\w\-]+=[\w\-\*]+)*$/),
  ),
});

export const updateRolePermissions = async (
  previousState: unknown,
  formData: FormData,
) => {
  const t = await getTranslations();

  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("updateRolePermissions");
    await authentication.authorizeAction("role", "manage");

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      id: formData.get("id"),
      permissionStrings: Array.from(formData.keys()).filter(
        (key) => key !== "id" && !key.startsWith("$ACTION"),
      ),
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
    await prisma.$transaction([
      prisma.permissionString.deleteMany({
        where: {
          roleId: result.data.id,
        },
      }),

      ...result.data.permissionStrings.map((permissionString) => {
        return prisma.permissionString.create({
          data: {
            roleId: result.data.id,
            permissionString,
          },
        });
      }),
    ]);

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/roles/${result.data.id}/permissions`);

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
