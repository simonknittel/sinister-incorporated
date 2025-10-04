"use server";

import { prisma } from "@/db";
import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  id: z.cuid(),
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
    redirect("/app/iam/roles");
  },
);
