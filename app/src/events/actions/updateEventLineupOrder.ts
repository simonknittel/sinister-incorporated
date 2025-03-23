"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";
import { isAllowedToManagePositions } from "../utils/isAllowedToManagePositions";
import { isEventUpdatable } from "../utils/isEventUpdatable";

const schema = z.object({
  eventId: z.string().cuid(),
  order: z.array(
    z.object({
      id: z.string().cuid(),
      order: z.number().int().min(0),
      childPositions: z
        .array(
          z.object({
            id: z.string().cuid(),
            order: z.number().int().min(0),
            childPositions: z
              .array(
                z.object({
                  id: z.string().cuid(),
                  order: z.number().int().min(0),
                  childPositions: z
                    .array(
                      z.object({
                        id: z.string().cuid(),
                        order: z.number().int().min(0),
                      }),
                    )
                    .optional(),
                }),
              )
              .optional(),
          }),
        )
        .optional(),
    }),
  ),
});

export const updateEventLineupOrder = async (formData: FormData) => {
  try {
    /**
     * Authenticate
     */
    await authenticateAction("updateEventLineupOrder");

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      eventId: formData.get("eventId"),
      order: JSON.parse(formData.get("order") as string) as unknown,
    });
    if (!result.success)
      return {
        error: "Ungültige Anfrage",
        errorDetails: result.error,
      };

    /**
     * Authorize the request
     */
    const event = await prisma.event.findUnique({
      where: {
        id: result.data.eventId,
      },
      include: {
        managers: true,
      },
    });
    if (!event) return { error: "Event nicht gefunden" };
    if (!isEventUpdatable(event))
      return { error: "Das Event ist bereits vorbei." };
    if (!(await isAllowedToManagePositions(event)))
      return { error: "Du bist nicht berechtigt, diese Aktion auszuführen." };

    /**
     * Update lineup order
     */
    const transactions = [];
    for (const position of result.data.order) {
      transactions.push(
        prisma.eventPosition.update({
          where: {
            id: position.id,
          },
          data: {
            order: position.order,
            parentPositionId: {
              set: null,
            },
          },
        }),
      );

      if (position.childPositions) {
        for (const childPosition of position.childPositions) {
          transactions.push(
            prisma.eventPosition.update({
              where: {
                id: childPosition.id,
              },
              data: {
                order: childPosition.order,
                parentPositionId: {
                  set: position.id,
                },
              },
            }),
          );

          if (childPosition.childPositions) {
            for (const grandChildPosition of childPosition.childPositions) {
              transactions.push(
                prisma.eventPosition.update({
                  where: {
                    id: grandChildPosition.id,
                  },
                  data: {
                    order: grandChildPosition.order,
                    parentPositionId: {
                      set: childPosition.id,
                    },
                  },
                }),
              );

              if (grandChildPosition.childPositions) {
                for (const grandGrandChildPosition of grandChildPosition.childPositions) {
                  transactions.push(
                    prisma.eventPosition.update({
                      where: {
                        id: grandGrandChildPosition.id,
                      },
                      data: {
                        order: grandGrandChildPosition.order,
                        parentPositionId: {
                          set: grandChildPosition.id,
                        },
                      },
                    }),
                  );
                }
              }
            }
          }
        }
      }
    }
    await prisma.$transaction(transactions);

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/events/${event.id}/lineup`);

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
    };
  }
};
