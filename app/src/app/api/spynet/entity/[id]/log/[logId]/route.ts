import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "~/app/_lib/auth/authenticateAndAuthorize";
import getLatestNoteAttributes from "~/app/_lib/getLatestNoteAttributes";
import { updateObject } from "~/app/api/_lib/algolia";
import errorHandler from "~/app/api/_lib/errorHandler";
import { prisma } from "~/server/db";

interface Params {
  id: string;
  logId: string;
}

const paramsSchema = z.object({
  id: z.string().cuid2(),
  logId: z.string().cuid2(),
});

const patchBodySchema = z.object({
  noteTypeId: z.string().trim().cuid2(),
  classificationLevelId: z.string().trim().cuid2(),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi();

    /**
     * Validate the request params and body
     */
    const paramsData = await paramsSchema.parseAsync(params);
    const body: unknown = await request.json();
    const data = await patchBodySchema.parseAsync(body);

    /**
     * Do the thing
     */
    const entityLog = await prisma.entityLog.findUnique({
      where: {
        id: paramsData.logId,
      },
      include: {
        entity: true,
        attributes: true,
      },
    });

    if (!entityLog) throw new Error("Not found");

    const { noteTypeId, classificationLevelId } =
      getLatestNoteAttributes(entityLog);

    const authorizationAttributes = [];

    if (noteTypeId) {
      authorizationAttributes.push({
        key: "noteTypeId",
        value: noteTypeId.value,
      });
    }

    if (classificationLevelId) {
      authorizationAttributes.push({
        key: "classificationLevelId",
        value: classificationLevelId.value,
      });
    }

    authentication.authorizeApi([
      {
        resource: "note",
        operation: "update",
        attributes: authorizationAttributes,
      },
      {
        resource: "note",
        operation: "create",
        attributes: [
          {
            key: "noteTypeId",
            value: data.noteTypeId,
          },
          {
            key: "classificationLevelId",
            value: data.classificationLevelId,
          },
        ],
      },
    ]);

    const item = await prisma.entityLogAttribute.createMany({
      data: [
        {
          eneityLogId: paramsData.logId,
          key: "noteTypeId",
          value: data.noteTypeId,
          createdById: authentication.session.user.id,
        },
        {
          eneityLogId: paramsData.logId,
          key: "classificationLevelId",
          value: data.classificationLevelId,
          createdById: authentication.session.user.id,
        },
      ],
    });

    /**
     * Respond with the result
     */
    return NextResponse.json(item);
  } catch (error) {
    /**
     * Respond with an error
     */
    return errorHandler(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi();

    /**
     * Validate the request params
     */
    const paramsData = await paramsSchema.parseAsync(params);

    /**
     * Do the thing
     */
    const entityLog = await prisma.entityLog.findFirst({
      where: {
        id: paramsData.logId,
      },
      include: {
        entity: true,
      },
    });

    if (!entityLog) throw new Error("Not found");

    switch (entityLog.type) {
      case "handle":
        authentication.authorizeApi([
          {
            resource: "handle",
            operation: "delete",
          },
        ]);
        break;
      case "teamspeakId":
        authentication.authorizeApi([
          {
            resource: "teamspeakId",
            operation: "delete",
          },
        ]);
        break;
      case "discordId":
        authentication.authorizeApi([
          {
            resource: "discordId",
            operation: "delete",
          },
        ]);
        break;
      case "note":
        authentication.authorizeApi([
          {
            resource: "note",
            operation: "delete",
          },
        ]);
        break;
    }

    await prisma.entityLog.delete({
      where: {
        id: paramsData.logId,
      },
    });

    /**
     * Update name field of user corresponding use entry
     */
    if (["handle", "discordId"].includes(entityLog.type)) {
      const entityLogs = await prisma.entityLog.findMany({
        where: {
          entityId: entityLog.entityId,
          type: {
            in: ["discordId", "handle"],
          },
          attributes: {
            some: {
              key: "confirmed",
              value: "confirmed",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const latestConfirmedHandleLog = entityLogs.find(
        (log) => log.type === "handle"
      );
      const latestConfirmedDiscordIdLog = entityLogs.find(
        (log) => log.type === "discordId"
      );

      if (latestConfirmedDiscordIdLog) {
        const account = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: "discord",
              providerAccountId: latestConfirmedDiscordIdLog.content!,
            },
          },
        });

        if (account) {
          await prisma.user.update({
            where: {
              id: account.userId,
            },
            data: {
              name: latestConfirmedHandleLog?.content || entityLog.entityId,
            },
          });
        }
      }
    }

    /**
     * Update Algolia
     */
    if (entityLog.type === "handle") {
      const handleLogs = await prisma.entityLog.findMany({
        where: {
          type: "handle",
          entityId: params.id,
          attributes: {
            some: {
              key: "confirmed",
              value: "confirmed",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      await updateObject(params.id, {
        handles: handleLogs.map((log) => log.content),
      });
    }

    /**
     * Respond with the result
     */
    return NextResponse.json({});
  } catch (error) {
    /**
     * Respond with an error
     */
    return errorHandler(error);
  }
}
