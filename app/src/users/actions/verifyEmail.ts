"use server";

import { createAuthenticatedAction } from "@/actions/utils/createAction";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  userId: z.cuid(),
});

export const verifyEmailAction = createAuthenticatedAction(
  "verifyEmail",
  schema,
  async (formData, authentication, data, t) => {
    if (!(await authentication.authorize("user", "manage")))
      return {
        error: t("Common.forbidden"),
        requestPayload: formData,
      };

    /**
     * Verify the email address
     */
    await prisma.$transaction([
      prisma.emailConfirmationToken.deleteMany({
        where: {
          userId: data.userId,
        },
      }),

      prisma.user.update({
        where: {
          id: data.userId,
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
      success: t("Common.successfullySaved"),
    };
  },
);
