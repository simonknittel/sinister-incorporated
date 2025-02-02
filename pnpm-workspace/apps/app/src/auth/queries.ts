import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import type { EmailConfirmationToken } from "@prisma/client";

export const getEmailConfirmationToken = async (
  token: EmailConfirmationToken["token"],
) => {
  return getTracer().startActiveSpan(
    "getEmailConfirmationToken",
    async (span) => {
      try {
        return await prisma.emailConfirmationToken.findUnique({
          where: {
            token,
            expires: {
              gt: new Date(),
            },
          },
        });
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
        });
        throw error;
      } finally {
        span.end();
      }
    },
  );
};
