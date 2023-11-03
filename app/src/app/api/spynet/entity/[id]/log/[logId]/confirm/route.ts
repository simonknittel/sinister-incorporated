import { type EntityLog } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "~/app/_lib/auth/authenticateAndAuthorize";
import { updateObject } from "~/app/api/_lib/algolia";
import errorHandler from "~/app/api/_lib/errorHandler";
import { prisma } from "~/server/db";
import { type EntityLogType } from "~/types";

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
            operation: "confirm",
          },
        ]);
        break;
      case "teamspeak-id":
        authentication.authorizeApi([
          {
            resource: "teamspeak-id",
            operation: "confirm",
          },
        ]);
        break;
      case "discord-id":
        authentication.authorizeApi([
          {
            resource: "discord-id",
            operation: "create",
          },
        ]);
        break;
      case "citizen-id":
        authentication.authorizeApi([
          {
            resource: "citizen-id",
            operation: "create",
          },
        ]);
        break;
      case "community-moniker":
        authentication.authorizeApi([
          {
            resource: "community-moniker",
            operation: "create",
          },
        ]);
        break;
      case "note":
        authentication.authorizeApi([
          {
            resource: "note",
            operation: "confirm",
          },
        ]);
        break;
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
    return errorHandler(error);
  }
}

async function updateAlgoliaWithGenericLogType(
  type: EntityLogType,
  algoliaKey: string,
  log: EntityLog,
) {
  const logs = await prisma.entityLog.findMany({
    where: {
      type,
      entityId: log.entityId,
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

  await updateObject(log.entityId, {
    [algoliaKey]: logs.map((log) => log.content),
  });
}
