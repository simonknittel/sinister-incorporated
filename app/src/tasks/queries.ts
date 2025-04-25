import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import {
  type Entity,
  type Role,
  type Task,
  type TaskAssignment,
} from "@prisma/client";
import { cache } from "react";

export const getTasks = cache(async () => {
  return getTracer().startActiveSpan("getTasks", async (span) => {
    try {
      const authentication = await requireAuthentication();
      if (!(await authentication.authorize("task", "read")))
        throw new Error("Forbidden");

      let tasks = await prisma.task.findMany({
        where: {
          cancelledAt: null,
          deletedAt: null,
          completedAt: null,
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
        include: {
          createdBy: true,
          assignments: {
            include: {
              citizen: true,
            },
          },
          requiredRoles: {
            include: {
              icon: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      tasks = (
        await Promise.all(
          tasks.map(async (task) => {
            const include = await isVisibleForCurrentUser(task);

            return {
              include,
              task,
            };
          }),
        )
      )
        .filter(({ include }) => include)
        .map(({ task }) => task);

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

export const getClosedTasks = cache(async () => {
  return getTracer().startActiveSpan("getClosedTasks", async (span) => {
    try {
      const authentication = await requireAuthentication();
      if (!(await authentication.authorize("task", "read")))
        throw new Error("Forbidden");

      let tasks = await prisma.task.findMany({
        where: {
          OR: [
            {
              cancelledAt: {
                not: null,
              },
            },
            {
              completedAt: {
                not: null,
              },
            },
            {
              expiresAt: {
                lt: new Date(),
              },
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
          completedBy: true,
          completionists: true,
          cancelledBy: true,
          deletedBy: true,
          requiredRoles: {
            include: {
              icon: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      tasks = (
        await Promise.all(
          tasks.map(async (task) => {
            const include = await isVisibleForCurrentUser(task);

            return {
              include,
              task,
            };
          }),
        )
      )
        .filter(({ include }) => include)
        .map(({ task }) => task);

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

export const getTaskById = cache(async (id: Task["id"]) => {
  return getTracer().startActiveSpan("getTaskById", async (span) => {
    try {
      const authentication = await requireAuthentication();
      if (!(await authentication.authorize("task", "read")))
        throw new Error("Forbidden");

      const task = await prisma.task.findUnique({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          assignments: true,
          completionists: true,
          requiredRoles: {
            include: {
              icon: true,
            },
          },
        },
      });

      if (!task) return null;

      if (!(await isVisibleForCurrentUser(task))) return null;

      return task;
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

const isVisibleForCurrentUser = async (
  task: Task & {
    assignments: TaskAssignment[];
    completionists?: Entity[];
    requiredRoles: Role[];
  },
) => {
  const authentication = await requireAuthentication();
  if (!authentication.session.entity) throw new Error("Unauthorized");

  if (await authentication.authorize("task", "manage")) return true;

  if (task.createdById === authentication.session.entity.id) return true;

  if (
    task.completionists?.some(
      (completionist) => completionist.id === authentication.session.entity!.id,
    )
  )
    return true;

  if (
    task.assignments.some(
      (assignment) =>
        assignment.citizenId === authentication.session.entity!.id,
    )
  )
    return true;

  if (task.requiredRoles.length > 0 && task.hiddenForOtherRoles) {
    return task.requiredRoles.some((role) =>
      authentication.session.entity!.roles?.split(",").includes(role.id),
    );
  }

  return true;
};
