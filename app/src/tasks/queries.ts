import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import { TaskVisibility, type Task } from "@prisma/client";
import { cache } from "react";

export const getTasks = cache(async () => {
  return getTracer().startActiveSpan("getTasks", async (span) => {
    try {
      const authentication = await requireAuthentication();
      if (!authentication.session.entityId) throw new Error("Forbidden");
      if (!(await authentication.authorize("task", "read")))
        throw new Error("Forbidden");

      if (await authentication.authorize("task", "manage")) {
        return await prisma.task.findMany({
          where: {
            cancelledAt: null,
            deletedAt: null,
            completedAt: null,
            AND: [
              {
                OR: [
                  {
                    expiresAt: {
                      gte: new Date(),
                    },
                  },
                  {
                    expiresAt: null,
                  },
                ],
              },
            ],
          },
          include: {
            createdBy: true,
            assignments: {
              include: {
                citizen: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      return await prisma.task.findMany({
        where: {
          cancelledAt: null,
          deletedAt: null,
          completedAt: null,
          AND: [
            {
              OR: [
                {
                  expiresAt: {
                    gte: new Date(),
                  },
                },
                {
                  expiresAt: null,
                },
              ],
            },
            {
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
                {
                  visibility: TaskVisibility.GROUP,
                  assignments: {
                    some: {
                      citizenId: authentication.session.entityId,
                    },
                  },
                },
                {
                  visibility: TaskVisibility.PERSONALIZED,
                  createdById: authentication.session.entityId,
                },
                {
                  visibility: TaskVisibility.GROUP,
                  createdById: authentication.session.entityId,
                },
              ],
            },
          ],
        },
        include: {
          createdBy: true,
          assignments: {
            include: {
              citizen: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
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
  });
});

export const getTaskById = cache(async (id: Task["id"]) => {
  return getTracer().startActiveSpan("getTaskById", async (span) => {
    try {
      const authentication = await requireAuthentication();
      if (!authentication.session.entityId) throw new Error("Forbidden");
      if (!(await authentication.authorize("task", "read")))
        throw new Error("Forbidden");

      if (await authentication.authorize("task", "manage")) {
        return await prisma.task.findUnique({
          where: {
            id,
            deletedAt: null,
          },
          include: {
            assignments: true,
            completionists: true,
          },
        });
      }

      return await prisma.task.findUnique({
        where: {
          id,
          deletedAt: null,
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
            {
              visibility: TaskVisibility.GROUP,
              assignments: {
                some: {
                  citizenId: authentication.session.entityId,
                },
              },
            },
            {
              visibility: TaskVisibility.PERSONALIZED,
              createdById: authentication.session.entityId,
            },
            {
              visibility: TaskVisibility.GROUP,
              createdById: authentication.session.entityId,
            },
            {
              completionists: {
                some: {
                  id: authentication.session.entityId,
                },
              },
            },
          ],
        },
        include: {
          assignments: true,
          completionists: true,
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
  });
});
