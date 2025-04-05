"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";
import { getTaskById } from "../queries";
import { isAllowedToManageTask } from "../utils/isAllowedToTask";
import { isTaskUpdatable } from "../utils/isTaskUpdatable";

const schema = z.object({
  id: z.string().cuid(),
  assignmentLimit: z.coerce.number().min(1).optional(),
  assignedToIds: z.array(z.string().cuid()).optional(),
});

export const updateTaskAssignments = async (formData: FormData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("updateTaskAssignments");
    if (!authentication.session.entityId)
      return {
        error: "Du bist nicht berechtigt, diese Aktion durchzuführen.",
        requestPayload: formData,
      };

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      id: formData.get("id"),
      assignmentLimit:
        formData.has("assignmentLimit") &&
        formData.get("assignmentLimit") !== ""
          ? formData.get("assignmentLimit")
          : undefined,
      assignedToIds: formData.has("assignedToId[]")
        ? formData.getAll("assignedToId[]")
        : undefined,
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

    /**
     * Update task
     */
    await prisma.task.update({
      where: { id: result.data.id },
      data: {
        assignmentLimit: result.data.assignmentLimit,
        assignments: {
          deleteMany: {
            citizenId: {
              in: task.assignments
                .filter(
                  (assignment) =>
                    !result.data.assignedToIds?.includes(assignment.citizenId),
                )
                .map((assignment) => assignment.citizenId),
            },
          },
          createMany: {
            data:
              result.data.assignedToIds?.map((assignedToId) => ({
                citizenId: assignedToId,
                createdById: authentication.session.entityId,
              })) || [],
            skipDuplicates: true,
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
