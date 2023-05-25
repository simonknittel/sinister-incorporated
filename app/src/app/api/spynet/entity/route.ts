import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "~/app/_lib/auth/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import { saveObject } from "../../_lib/algolia";
import errorHandler from "../../_lib/errorHandler";

const postBodySchema = z.object({
  type: z.union([z.literal("citizen"), z.literal("organization")]),
  spectrumId: z.string().trim(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi();
    authentication.authorizeApi([
      {
        resource: "citizen",
        operation: "create",
      },
    ]);

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = await postBodySchema.parseAsync(body);

    /**
     * Do the thing
     */
    const log = await prisma.entityLog.findFirst({
      where: {
        type: "spectrum-id",
        content: data.spectrumId,
      },
      include: {
        entity: true,
      },
    });

    if (log) return NextResponse.json(log.entity);

    const item = await prisma.entityLog.create({
      data: {
        type: "spectrum-id",
        content: data.spectrumId,
        submittedBy: {
          connect: {
            id: authentication.session.user.id,
          },
        },
        entity: {
          create: {
            type: data.type,
            createdBy: {
              connect: {
                id: authentication.session.user.id,
              },
            },
          },
        },
      },
      include: {
        entity: true,
      },
    });

    /**
     * Add new entity to Algolia
     */
    await saveObject(item.entityId, {
      type: "citizen",
      spectrumId: data.spectrumId,
    });

    /**
     * Respond with the result
     */
    return NextResponse.json(item.entity);
  } catch (error) {
    /**
     * Respond with an error
     */
    return errorHandler(error);
  }
}
