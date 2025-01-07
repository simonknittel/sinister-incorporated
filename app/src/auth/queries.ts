import { prisma } from "@/db";
import type { EmailConfirmationToken } from "@prisma/client";

export const getEmailConfirmationToken = async (
  token: EmailConfirmationToken["token"],
) => {
  return prisma.emailConfirmationToken.findUnique({
    where: {
      token,
      expires: {
        gt: new Date(),
      },
    },
  });
};
