import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import { TaskVisibility } from "@prisma/client";
import { cache } from "react";

export const getTasks = cache(async () => {
  return getTracer().startActiveSpan("getTasks", async (span) => {
    try {
      const authentication = await requireAuthentication();
      if (!authentication.session.entityId) throw new Error("Forbidden");
      if (!(await authentication.authorize("task", "read")))
        throw new Error("Forbidden");

      const tasks = await prisma.task.findMany({
        where: {
          cancelledAt: null,
          deletedAt: null,
          expiresAt: {
            gte: new Date(),
          },
          OR: [
            {
              visibility: TaskVisibility.PUBLIC,
            },
            {
              visibility: TaskVisibility.PERSONALIZED,
              assignments: {
                some: {
                  citizenId: authentication.session.entityId,
                },
              },
            },
          ],
        },
        include: {
          assignments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return tasks;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
});
