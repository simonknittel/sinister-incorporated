"use server";

import { createAuthenticatedAction } from "@/actions/utils/createAction";
import { prisma } from "@/db";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  id: z.string().cuid(),
});

export const deleteRole = createAuthenticatedAction(
  "deleteRole",
  schema,
  async (formData, authentication, data, t) => {
    /**
     * Authorize the request
     */
    if (!(await authentication.authorize("role", "manage")))
      return {
        error: t("Common.forbidden"),
        requestPayload: formData,
      };

    /**
     * Update role
     */
    await prisma.$transaction([
      prisma.role.delete({
        where: {
          id: data.id,
        },
      }),

      prisma.permissionString.deleteMany({
        where: {
          permissionString: {
            contains: data.id,
          },
        },
      }),
    ]);

    /**
     * Redirect
     */
    redirect("/app/roles");
  },
);
