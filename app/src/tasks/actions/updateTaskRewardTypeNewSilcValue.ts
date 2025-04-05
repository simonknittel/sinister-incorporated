"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { TaskRewardType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";
import { getTaskById } from "../queries";
import { isAllowedToManageTask } from "../utils/isAllowedToTask";
import { isTaskUpdatable } from "../utils/isTaskUpdatable";

const schema = z.object({
  id: z.string().cuid(),
  rewardTypeNewSilcValue: z.number().min(1),
});

export const updateTaskRewardTypeNewSilcValue = async (formData: FormData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction(
      "updateTaskRewardTypeNewSilcValue",
    );

    if (!authentication.session.entityId)
      return {
        error: "Du bist nicht berechtigt, diese Aktion auszuführen.",
        requestPayload: formData,
      };

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      id: formData.get("id"),
      rewardTypeNewSilcValue: formData.get("rewardTypeNewSilcValue"),
    });
    if (!result.success)
      return {
        error: "Ungültige Anfrage",
        errorDetails: result.error,
        requestPayload: formData,
      };

    /**
     * Authorize the request
     */
    const task = await getTaskById(result.data.id);
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
    if (
      !(await authentication.authorize("task", "create", [
        {
          key: "taskRewardType",
          value: TaskRewardType.NEW_SILC,
        },
      ]))
    )
      return {
        error: "Du bist nicht berechtigt, diese Aktion auszuführen.",
        requestPayload: formData,
      };

    /**
     * Update task
     */
    await prisma.task.update({
      where: { id: result.data.id },
      data: {
        rewardTypeNewSilcValue: result.data.rewardTypeNewSilcValue,
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
  } catch (error) {
    unstable_rethrow(error);
    void log.error("Internal Server Error", { error: serializeError(error) });
    return {
      error:
        "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
      requestPayload: formData,
    };
  }
};
