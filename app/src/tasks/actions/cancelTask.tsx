"use server";

import { createAuthenticatedAction } from "@/common/actions/createAction";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getTaskById } from "../queries";
import { isAllowedToManageTask } from "../utils/isAllowedToTask";
import { isTaskUpdatable } from "../utils/isTaskUpdatable";

const schema = z.object({
  id: z.union([z.string().cuid(), z.string().cuid2()]),
});

export const cancelTask = createAuthenticatedAction(
  "cancelTask",
  schema,
  async (formData: FormData, authentication, data) => {
    if (!authentication.session.entityId)
      return {
        error: "Du bist nicht berechtigt, diese Aktion auszuführen.",
        requestPayload: formData,
      };

    /**
     * Authorize the request
     */
    const task = await getTaskById(data.id);
    if (!task)
      return { error: "Task nicht gefunden", requestPayload: formData };
    if (!isTaskUpdatable(task))
      return {
        error: "Der Task ist bereits abgeschlossen.",
        requestPayload: formData,
      };
    if (!(await isAllowedToManageTask(task)))
      return {
        error: "Du bist nicht berechtigt, diese Aktion auszuführen.",
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
        cancelledAt: new Date(),
        cancelledBy: {
          connect: {
            id: authentication.session.entityId,
          },
        },
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath("/app/tasks");

    /**
     * Respond with the result
     */
    return {
      success: "Erfolgreich abgebrochen.",
    };
  },
);
