import { NextResponse } from "next/server";
import { z } from "zod";
import apiErrorHandler from "../../../../../../../../lib/apiErrorHandler";
import { authenticateApi } from "../../../../../../../../lib/auth/server";
import getLatestNoteAttributes from "../../../../../../../../lib/getLatestNoteAttributes";
import { prisma } from "../../../../../../../../server/db";
import { updateAlgoliaWithGenericLogType } from "../_lib/updateAlgoliaWithGenericLogType";
import { updateEntityCaches } from "../_lib/updateEntityCaches";

interface Params {
  id: string;
  logId: string;
}

const paramsSchema = z.object({
  id: z.string().cuid2(),
  logId: z.string().cuid2(),
});

const patchBodySchema = z.object({
  confirmed: z.union([z.literal("confirmed"), z.literal("false-report")]),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi(
      "/api/spynet/entity/[id]/log/[logId]/confirm",
      "PATCH",
    );

    /**
     * Validate the request params and body
     */
    const paramsData = paramsSchema.parse(params);
    const body: unknown = await request.json();
    const data = patchBodySchema.parse(body);

    /**
     * Do the thing
     */
    const entityLog = await prisma.entityLog.findFirst({
      where: {
        id: paramsData.logId,
      },
      include: {
        entity: true,
        attributes: true,
      },
    });

    if (!entityLog) throw new Error("Not found");

    switch (entityLog.type) {
      case "handle":
      case "teamspeak-id":
        authentication.authorizeApi(entityLog.type, "confirm");
        break;
      case "discord-id":
      case "citizen-id":
      case "community-moniker":
        authentication.authorizeApi(entityLog.type, "create");
        break;
      case "note":
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

        authentication.authorizeApi("note", "confirm", authorizationAttributes);
        break;

      default:
        throw new Error("Bad request");
    }

    const item = await prisma.entityLogAttribute.create({
      data: {
        entityLog: {
          connect: {
            id: paramsData.logId,
          },
        },
        key: "confirmed",
        value: data.confirmed,
        createdBy: {
          connect: {
            id: authentication.session.user.id,
          },
        },
      },
    });

    // Update username
    if (["handle", "discord-id"].includes(entityLog.type)) {
      const entityLogs = await prisma.entityLog.findMany({
        where: {
          entityId: entityLog.entityId,
          type: {
            in: ["discord-id", "handle"],
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
        (log) => log.type === "handle",
      );
      const latestConfirmedDiscordIdLog = entityLogs.find(
        (log) => log.type === "discord-id",
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

    await updateEntityCaches(entityLog);

    /**
     * Update Algolia
     */
    switch (entityLog.type) {
      case "handle":
        await updateAlgoliaWithGenericLogType(
          entityLog.type,
          "handles",
          entityLog,
        );
        break;
      case "citizen-id":
        await updateAlgoliaWithGenericLogType(
          entityLog.type,
          "citizenIds",
          entityLog,
        );
        break;
      case "community-moniker":
        await updateAlgoliaWithGenericLogType(
          entityLog.type,
          "communityMonikers",
          entityLog,
        );
        break;

      default:
        break;
    }

    /**
     * Respond with the result
     */
    return NextResponse.json(item);
  } catch (error) {
    /**
     * Respond with an error
     */
    return apiErrorHandler(error);
  }
}
