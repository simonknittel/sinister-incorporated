"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { TaskRewardType, TaskVisibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  visibility: z.nativeEnum(TaskVisibility),
  assignmentLimit: z.coerce.number().min(1).optional(),
  title: z.string().trim().max(64),
  description: z.string().trim().max(512).optional(),
  expiresAt: z.coerce.date().optional(),
  rewardType: z.nativeEnum(TaskRewardType),
  rewardTypeTextValue: z.string().trim().max(512).optional(),
  rewardTypeAuecValue: z.coerce.number().min(1).optional(),
  rewardTypeSilcValue: z.coerce.number().min(1).optional(),
  rewardTypeNewSilcValue: z.coerce.number().min(1).optional(),
});

export const createTask = async (formData: FormData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("createTask");
    if (!authentication.session.entityId)
      return {
        error: "Du bist nicht berechtigt, diese Aktion durchzuführen.",
        requestPayload: formData,
      };

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      visibility: formData.get("visibility"),
      title: formData.get("title"),
      description: formData.has("description")
        ? formData.get("description")
        : undefined,
      expiresAt: formData.has("expiresAt")
        ? formData.get("expiresAt")
        : undefined,
      rewardType: formData.get("rewardType"),
      rewardTypeTextValue: formData.has("rewardTypeTextValue")
        ? formData.get("rewardTypeTextValue")
        : undefined,
      rewardTypeAuecValue: formData.has("rewardTypeAuecValue")
        ? formData.get("rewardTypeAuecValue")
        : undefined,
      rewardTypeSilcValue: formData.has("rewardTypeSilcValue")
        ? formData.get("rewardTypeSilcValue")
        : undefined,
      rewardTypeNewSilcValue: formData.has("rewardTypeNewSilcValue")
        ? formData.get("rewardTypeNewSilcValue")
        : undefined,
    });
    if (!result.success)
      return {
        error: "Ungültige Anfrage",
        errorDetails: result.error,
        requestPayload: formData,
      };

    /**
     * Create task
     */
    await prisma.task.create({
      data: {
        visibility: result.data.visibility,
        assignmentLimit: result.data.assignmentLimit,
        title: result.data.title,
        description: result.data.description,
        createdBy: {
          connect: {
            id: authentication.session.entityId,
          },
        },
        expiresAt: result.data.expiresAt,
        rewardType: result.data.rewardType,
        rewardTypeTextValue: result.data.rewardTypeTextValue,
        rewardTypeAuecValue: result.data.rewardTypeAuecValue,
        rewardTypeSilcValue: result.data.rewardTypeSilcValue,
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
