"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  applicationId: z.string().cuid(),
});

export const updateEventPositionAcceptedApplication = async (
  formData: FormData,
) => {
  try {
    /**
     * Authenticate
     */
    const authentication = await authenticateAction(
      "updateEventPositionAcceptedApplication",
    );

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      applicationId: formData.get("applicationId"),
    });
    if (!result.success)
      return {
        error: "Ungültige Anfrage",
        errorDetails: result.error,
      };

    /**
     * Authorize the request
     */
    const application = await prisma.eventPositionApplication.findUnique({
      where: {
        id: result.data.applicationId,
      },
      include: {
        position: {
          include: {
            event: true,
          },
        },
      },
    });
    if (
      authentication.session.discordId !==
        application?.position.event.discordCreatorId &&
      !(await authentication.authorize("othersEventPosition", "update"))
    )
      throw new Error("Forbidden");

    /**
     * updatePosition
     */
    const updatedPosition = await prisma.eventPosition.update({
      where: {
        id: application?.positionId,
      },
      data: {
        acceptedApplication: {
          connect: {
            id: result.data.applicationId,
          },
        },
      },
      include: {
        event: true,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/events/${updatedPosition.event.discordId}/lineup`);

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
