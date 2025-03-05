import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import { cache } from "react";

export const getSilcBalanceOfCurrentCitizen = cache(async () => {
  return getTracer().startActiveSpan(
    "getSilcBalanceOfCurrentCitizen",
    async (span) => {
      try {
        const authentication = await requireAuthentication();
        if (!authentication.session.entityId) throw new Error("Forbidden");
        if (
          !(await authentication.authorize(
            "silcBalanceOfCurrentCitizen",
            "read",
          ))
        )
          throw new Error("Forbidden");

        const entity = await prisma.entity.findUniqueOrThrow({
          where: {
            id: authentication.session.entityId,
          },
          select: {
            silcBalance: true,
          },
        });

        return entity.silcBalance;
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
});

export const getSilcBalanceOfAllCitizens = cache(async () => {
  return getTracer().startActiveSpan(
    "getSilcBalanceOfAllCitizens",
    async (span) => {
      try {
        return await prisma.entity.findMany({
          where: {
            totalEarnedSilc: {
              not: {
                equals: 0,
              },
            },
          },
          select: {
            id: true,
            handle: true,
            silcBalance: true,
            totalEarnedSilc: true,
          },
          orderBy: {
            silcBalance: "desc",
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
});

export const getSilcTransactionsOfAllCitizens = cache(async () => {
  return getTracer().startActiveSpan(
    "getSilcTransactionsOfAllCitizens",
    async (span) => {
      try {
        return await prisma.silcTransaction.findMany({
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: "asc",
          },
          include: {
            receiver: {
              select: {
                id: true,
                handle: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                handle: true,
              },
            },
            updatedBy: {
              select: {
                id: true,
                handle: true,
              },
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
});
