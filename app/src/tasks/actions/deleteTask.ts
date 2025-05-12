"use server";

import { createAuthenticatedAction } from "@/actions/utils/createAction";
import { prisma } from "@/db";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getTaskById } from "../queries";
import {
  isAllowedToDeleteTask,
  isAllowedToManageTask,
} from "../utils/isAllowedToTask";

const schema = z.object({
  id: z.union([z.string().cuid(), z.string().cuid2()]),
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
    if (!task)
      return { error: "Task nicht gefunden", requestPayload: formData };
    if (!(await isAllowedToManageTask(task)))
      return {
        error: t("Common.forbidden"),
        requestPayload: formData,
      };

    /**
     * Delete position
     */
    await prisma.task.update({
      where: {
        id: data.id,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: {
          connect: {
            id: authentication.session.entity.id,
          },
        },
      },
    });

    /**
     * Revalidate cache(s)
     */
    redirect("/app/tasks");

    /**
     * Respond with the result
     */
    return {
      success: t("Common.successfullyDeleted"),
    };
  },
);
