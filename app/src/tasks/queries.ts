import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { withTrace } from "@/tracing/utils/withTrace";
import {
  TaskVisibility,
  type Entity,
  type Role,
  type Task,
  type TaskAssignment,
} from "@prisma/client";
import { forbidden } from "next/navigation";
import { cache } from "react";

export const getTasks = cache(
  withTrace("getTasks", async () => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("task", "read"))) forbidden();

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
  }),
);

export const getClosedTasks = cache(
  withTrace("getClosedTasks", async () => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("task", "read"))) forbidden();

    let tasks = await prisma.task.findMany({
      where: {
        deletedAt: null,
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
  }),
);

export const getTaskById = cache(
  withTrace("getTaskById", async (id: Task["id"]) => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("task", "read"))) forbidden();

    const task = await prisma.task.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        assignments: {
          include: {
            citizen: true,
          },
        },
        completionists: true,
        requiredRoles: {
          include: {
            icon: true,
          },
        },
        createdBy: true,
      },
    });

    if (!task) return null;

    if (!(await isVisibleForCurrentUser(task))) return null;

    return task;
  }),
);

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

  if (task.visibility === TaskVisibility.PUBLIC) return true;

  return false;
};

export const getMyAssignedTasks = cache(
  withTrace("getMyAssignedTasks", async () => {
    const authentication = await requireAuthentication();
    if (!authentication.session.entity) forbidden();
    if (!(await authentication.authorize("task", "read"))) forbidden();

    let tasks = await prisma.task.findMany({
      where: {
        assignments: {
          some: {
            citizenId: authentication.session.entity.id,
          },
        },
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
        assignments: { include: { citizen: true } },
        completionists: true,
        requiredRoles: {
          include: {
            icon: true,
          },
        },
        createdBy: true,
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
  }),
);
