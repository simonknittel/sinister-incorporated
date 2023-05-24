import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "~/app/_lib/auth/authenticateAndAuthorize";
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
  confirmed: z.literal(true),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi();

    /**
     * Validate the request params
     */
    const paramsData = await paramsSchema.parseAsync(params);

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    await patchBodySchema.parseAsync(body);

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
      case "discordId":
        authentication.authorizeApi([
          {
            resource: "discordId",
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
        value: "true",
        createdBy: {
          connect: {
            id: authentication.session.user.id,
          },
        },
      },
    });

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
              value: "true",
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
          entityId: entityLog.entityId,
          attributes: {
            some: {
              key: "confirmed",
              value: "true",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      await updateObject(entityLog.entityId, {
        handles: handleLogs.map((log) => log.content),
      });
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
