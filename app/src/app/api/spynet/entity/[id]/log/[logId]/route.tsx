import algoliasearch from "algoliasearch";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAndAuthorize } from "~/app/_utils/authenticateAndAuthorize";
import errorHandler from "~/app/api/_utils/errorHandler";
import { env } from "~/env.mjs";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";

interface Params {
  id: string;
  logId: string;
}

const patchParamsSchema = z.object({
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
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    /**
     * Validate the request params
     */
    const paramsData = await patchParamsSchema.parseAsync(params);

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
        await authenticateAndAuthorize("confirm-handle");
        break;
      case "discord-id":
        await authenticateAndAuthorize("confirm-discord-id");
        break;
      case "note":
        await authenticateAndAuthorize("confirm-note");
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
            id: session.user.id,
          },
        },
      },
    });

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
        (log) => log.type === "discord-id"
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
     * Remove "(unbestätigt)" from Algolia entry
     */
    if (entityLog.type === "handle") {
      const client = algoliasearch(
        env.NEXT_PUBLIC_ALGOLIA_APP_ID,
        env.ALGOLIA_ADMIN_API_KEY
      );
      const index = client.initIndex("spynet_entities");
      const handleLogs = await prisma.entityLog.findMany({
        where: {
          type: "handle",
          entityId: entityLog.entityId,
        },
        include: {
          attributes: {
            where: {
              key: "confirmed",
              value: "true",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      void index.partialUpdateObject({
        objectID: entityLog.entityId,
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
