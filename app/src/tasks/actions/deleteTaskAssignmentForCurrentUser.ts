"use server";

import { createAuthenticatedAction } from "@/common/actions/createAction";
import { prisma } from "@/db";
import { TaskVisibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getTaskById } from "../queries";
import { isTaskUpdatable } from "../utils/isTaskUpdatable";

const schema = z.object({
  taskId: z.string().cuid(),
});

export const deleteTaskAssignmentForCurrentUser = createAuthenticatedAction(
  "deleteTaskAssignmentForCurrentUser",
  schema,
  async (formData: FormData, authentication, data) => {
    if (!authentication.session.entityId)
      return {
        error: "Du bist nicht berechtigt, diese Aktion auszuführen.",
        requestPayload: formData,
      };

    const task = await getTaskById(data.taskId);
    if (!task)
      return { error: "Task nicht gefunden", requestPayload: formData };
    if (!isTaskUpdatable(task))
      return {
        error: "Der Task ist bereits abgeschlossen.",
        requestPayload: formData,
      };

    if (task.visibility === TaskVisibility.PERSONALIZED)
      return {
        error:
          "Du kannst deine Teilnahme an einem personalisierten Task nicht selbstständig ändern.",
        requestPayload: formData,
      };

    /**
     * Delete
     */
    await prisma.taskAssignment.delete({
      where: {
        taskId_citizenId: {
          taskId: data.taskId,
          citizenId: authentication.session.entityId,
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
      success: "Erfolgreich gespeichert.",
    };
  },
);
