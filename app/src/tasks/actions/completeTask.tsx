"use server";

import { createAuthenticatedAction } from "@/common/actions/createAction";
import { prisma } from "@/db";
import { updateCitizensSilcBalances } from "@/silc/utils/updateCitizensSilcBalances";
import { TaskRewardType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getTaskById } from "../queries";
import { isAllowedToManageTask } from "../utils/isAllowedToTask";
import { isTaskUpdatable } from "../utils/isTaskUpdatable";

const schema = z.object({
  id: z.union([z.string().cuid(), z.string().cuid2()]),
});

export const completeTask = createAuthenticatedAction(
  "completeTask",
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

    if (task.assignments.length <= 0)
      return {
        error:
          "Der Task kann nicht abgeschlossen werden, ohne dass ihn jemand angenommen hat.",
        requestPayload: formData,
      };

    /**
     * Update
     */
    await prisma.task.update({
      where: {
        id: data.id,
      },
      data: {
        completedAt: new Date(),
        completedBy: {
          connect: {
            id: authentication.session.entityId,
          },
        },
        completionists: {
          connect: task.assignments.map((assignment) => ({
            id: assignment.citizenId,
          })),
        },
      },
    });

    /**
     * Create SILC transaction
     */
    if (
      task.rewardType === TaskRewardType.SILC ||
      task.rewardType === TaskRewardType.NEW_SILC
    ) {
      if (task.rewardType === TaskRewardType.SILC) {
        await prisma.$transaction([
          prisma.silcTransaction.createMany({
            data: task.assignments.map((assignment) => ({
              receiverId: assignment.citizenId,
              value: task.rewardTypeSilcValue!,
              description: `Task erfüllt: ${task.title}`,
              createdById: authentication.session.entityId,
            })),
          }),

          ...(task.createdById
            ? [
                prisma.silcTransaction.create({
                  data: {
                    receiverId: task.createdById,
                    value: -(
                      task.rewardTypeSilcValue! * task.assignments.length
                    ),
                    description: `Task abgeschlossen: ${task.title}`,
                    createdById: authentication.session.entityId,
                  },
                }),
              ]
            : []),
        ]);

        /**
         * Update citizens' balances
         */
        if (task.createdById)
          await updateCitizensSilcBalances([task.createdById]);
      } else if (task.rewardType === TaskRewardType.NEW_SILC) {
        await prisma.silcTransaction.createMany({
          data: task.assignments.map((assignment) => ({
            receiverId: assignment.citizenId,
            value: task.rewardTypeNewSilcValue!,
            description: `Task erfüllt: ${task.title}`,
            createdById: authentication.session.entityId,
          })),
        });
      }

      /**
       * Update citizens' balances
       */
      await updateCitizensSilcBalances(
        task.assignments.map((assignment) => assignment.citizenId),
      );

      /**
       * Revalidate cache(s)
       */
      revalidatePath("/app/silc");
      revalidatePath("/app/silc/transactions");
      revalidatePath("/app/dashboard");
    }

    /**
     * Revalidate cache(s)
     */
    revalidatePath("/app/tasks");

    /**
     * Respond with the result
     */
    return {
      success: "Erfolgreich gelöscht.",
    };
  },
);
