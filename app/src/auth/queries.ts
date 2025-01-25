import { prisma } from "@/db";
import { trace } from "@opentelemetry/api";
import type { EmailConfirmationToken } from "@prisma/client";

export const getEmailConfirmationToken = async (
  token: EmailConfirmationToken["token"],
) => {
  return await trace
    .getTracer("sam")
    .startActiveSpan("getEmailConfirmationToken", async (span) => {
      try {
        return prisma.emailConfirmationToken.findUnique({
          where: {
            token,
            expires: {
              gt: new Date(),
            },
          },
        });
      } finally {
        span.end();
      }
    });
};
