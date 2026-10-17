"use server";

import { prisma } from "@/db";
import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { rejectConflict } from "@/modules/actions/utils/rejectConflict";
import { AuditEventType } from "@/modules/audit/utils/AuditEventTypes";
import { createAuditEvents } from "@/modules/audit/utils/createAuditEvent";
import { triggerNotificationsAfterSave } from "@/modules/notifications/utils/triggerNotification";
import { refresh } from "next/cache";
import * as z from "zod";
import { getTaskById } from "../queries/getTaskById";
import {
  isAllowedToDeleteTask,
  isAllowedToManageTask,
} from "../utils/isAllowedToTask";
import { TASK_NOT_FOUND_ERROR } from "../utils/mapTaskErrorToActionResponse";

const schema = z.object({
  id: z.union([z.cuid(), z.cuid2()]),
});

export const deleteTask = createAuthenticatedAction(
  "deleteTask",
  schema,
  async (formData, authentication, data, t) => {
    if (!authentication.session.entity || !(await isAllowedToDeleteTask()))
      return {
        error: t("Common.forbidden"),
        requestPayload: formData,
      };

    /**
     * Authorize the request
     */
    const task = await getTaskById(data.id);
    if (!task) {
      /** A different user deleted the task before, and the page must show it */
      return rejectConflict(TASK_NOT_FOUND_ERROR, formData);
    }
    if (!(await isAllowedToManageTask(task)))
      return {
        error: t("Common.forbidden"),
        requestPayload: formData,
      };

    /**
     * Delete the task. The condition on `deletedAt` lets only one of two
     * parallel requests delete the task. The other request stops here, thus
     * it writes no audit event and sends nothing.
     */
    const { count } = await prisma.task.updateMany({
      where: {
        id: task.id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        deletedById: authentication.session.entity.id,
      },
    });
    if (count === 0) return rejectConflict(TASK_NOT_FOUND_ERROR, formData);

    refresh();

    await createAuditEvents([
      {
        type: AuditEventType.TASK_DELETED,
        data: {
          taskId: task.id,
          title: task.title,
        },
        createdById: authentication.session.user.id,
      },
    ]);

    /**
     * Trigger notifications
     */
    const areNotificationsSent = await triggerNotificationsAfterSave([
      {
        type: "TaskDeleted",
        payload: {
          taskId: task.id,
        },
      },
    ]);

    /**
     * Respond with the result
     */
    return {
      success: t("Common.successfullyDeleted"),
      ...(areNotificationsSent
        ? {}
        : { warning: t("Common.notificationsFailed") }),
    };
  },
);
