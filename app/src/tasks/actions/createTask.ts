"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { createId } from "@paralleldrive/cuid2";
import { TaskRewardType, TaskVisibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  visibility: z.nativeEnum(TaskVisibility),
  assignmentLimit: z.coerce.number().min(1).optional(),
  assignedToIds: z.array(z.string().cuid()).optional(),
  title: z.string().trim().max(64),
  description: z.string().trim().max(512).optional(),
  expiresAt: z.coerce.date().optional(),
  rewardType: z.nativeEnum(TaskRewardType),
  rewardTypeTextValue: z.string().trim().max(128).optional(),
  rewardTypeSilcValue: z.coerce.number().min(1).optional(),
  rewardTypeNewSilcValue: z.coerce.number().min(1).optional(),
  repeatable: z.coerce.number().min(1),
  requiredRoles: z.array(z.string().cuid()).optional(),
  hiddenForOtherRoles: z.coerce.boolean().optional(),
});

export const createTask = async (formData: FormData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("createTask");
    await authentication.authorizeAction("task", "create");
    if (!authentication.session.entity)
      return {
        error: "Du bist nicht berechtigt, diese Aktion durchzuführen.",
        requestPayload: formData,
      };

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      visibility: formData.get("visibility"),
      assignmentLimit:
        formData.has("assignmentLimit") &&
        formData.get("assignmentLimit") !== ""
          ? formData.get("assignmentLimit")
          : undefined,
      assignedToIds: formData.getAll("assignedToId[]"),
      title: formData.get("title"),
      description: formData.has("description")
        ? formData.get("description")
        : undefined,
      expiresAt:
        formData.get("expiresAt") && formData.get("expiresAt") !== ""
          ? formData.get("expiresAt")
          : undefined,
      rewardType: formData.get("rewardType"),
      rewardTypeTextValue: formData.has("rewardTypeTextValue")
        ? formData.get("rewardTypeTextValue")
        : undefined,
      rewardTypeSilcValue: formData.has("rewardTypeSilcValue")
        ? formData.get("rewardTypeSilcValue")
        : undefined,
      rewardTypeNewSilcValue: formData.has("rewardTypeNewSilcValue")
        ? formData.get("rewardTypeNewSilcValue")
        : undefined,
      repeatable: formData.get("repeatable"),
      requiredRoles: formData.getAll("requiredRole[]"),
      hiddenForOtherRoles: formData.get("hiddenForOtherRoles")
        ? formData.get("hiddenForOtherRoles")
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
    if (
      (result.data.visibility === TaskVisibility.PERSONALIZED ||
        result.data.visibility === TaskVisibility.GROUP) &&
      !(await authentication.authorize("task", "create", [
        {
          key: "taskVisibility",
          value: TaskVisibility.PERSONALIZED,
        },
      ]))
    )
      return {
        error: "Du bist nicht berechtigt, diese Aktion durchzuführen.",
        requestPayload: formData,
      };
    if (
      result.data.rewardType === TaskRewardType.NEW_SILC &&
      !(await authentication.authorize("task", "create", [
        {
          key: "taskRewardType",
          value: TaskRewardType.NEW_SILC,
        },
      ]))
    )
      return {
        error: "Du bist nicht berechtigt, diese Aktion durchzuführen.",
        requestPayload: formData,
      };

    /**
     * Create task
     */
    switch (result.data.visibility) {
      case TaskVisibility.PUBLIC:
        await prisma.task.create({
          data: {
            visibility: result.data.visibility,
            assignmentLimit: result.data.assignmentLimit,
            title: result.data.title,
            description: result.data.description,
            createdBy: {
              connect: {
                id: authentication.session.entity.id,
              },
            },
            expiresAt: result.data.expiresAt,
            rewardType: result.data.rewardType,
            rewardTypeTextValue: result.data.rewardTypeTextValue,
            rewardTypeSilcValue: result.data.rewardTypeSilcValue,
            rewardTypeNewSilcValue: result.data.rewardTypeNewSilcValue,
            repeatable: result.data.repeatable,
            requiredRoles: {
              connect: result.data.requiredRoles
                ? result.data.requiredRoles.map((roleId) => ({
                    id: roleId,
                  }))
                : [],
            },
            hiddenForOtherRoles: result.data.hiddenForOtherRoles,
          },
        });
        break;

      case TaskVisibility.GROUP:
        await prisma.task.create({
          data: {
            visibility: result.data.visibility,
            assignmentLimit: result.data.assignmentLimit,
            title: result.data.title,
            description: result.data.description,
            createdBy: {
              connect: {
                id: authentication.session.entity.id,
              },
            },
            expiresAt: result.data.expiresAt,
            rewardType: result.data.rewardType,
            rewardTypeTextValue: result.data.rewardTypeTextValue,
            rewardTypeSilcValue: result.data.rewardTypeSilcValue,
            rewardTypeNewSilcValue: result.data.rewardTypeNewSilcValue,
            assignments: {
              createMany: {
                data:
                  result.data.assignedToIds!.map((id) => ({
                    citizenId: id,
                    createdById: authentication.session.entity!.id,
                  })) || [],
              },
            },
            repeatable: result.data.repeatable,
          },
        });
        break;

      case TaskVisibility.PERSONALIZED:
        await prisma.$transaction([
          ...result.data.assignedToIds!.flatMap((assignedToId) => {
            const id = createId();
            return [
              prisma.task.create({
                data: {
                  id,
                  visibility: result.data.visibility,
                  assignmentLimit: result.data.assignmentLimit,
                  title: result.data.title,
                  description: result.data.description,
                  createdById: authentication.session.entity!.id,
                  expiresAt: result.data.expiresAt,
                  rewardType: result.data.rewardType,
                  rewardTypeTextValue: result.data.rewardTypeTextValue,
                  rewardTypeSilcValue: result.data.rewardTypeSilcValue,
                  rewardTypeNewSilcValue: result.data.rewardTypeNewSilcValue,
                  repeatable: result.data.repeatable,
                },
              }),

              prisma.taskAssignment.create({
                data: {
                  taskId: id,
                  citizenId: assignedToId,
                  createdById: authentication.session.entity!.id,
                },
              }),
            ];
          }),
        ]);
        break;

      default:
        return {
          error: "Ungültige Anfrage",
          requestPayload: formData,
        };
    }

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
