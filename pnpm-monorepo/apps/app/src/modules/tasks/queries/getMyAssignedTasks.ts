import { prisma } from "@/db";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { getOpenTasksWhere, TASK_LIST_SELECT } from "@sam-monorepo/application";
import { forbidden } from "next/navigation";
import { cache } from "react";

export const getMyAssignedTasks = cache(
  withTrace("getMyAssignedTasks", async () => {
    const authentication = await requireAuthentication();
    if (!authentication.session.entity) forbidden();
    if (!(await authentication.authorize("task", "read"))) forbidden();

    // An assignee can always see the task (see getVisibleTasksWhere)
    return prisma.task.findMany({
      where: {
        AND: [
          {
            assignments: {
              some: {
                citizenId: authentication.session.entity.id,
              },
            },
          },
          getOpenTasksWhere(new Date()),
        ],
      },
      select: TASK_LIST_SELECT,
    });
  }),
);
