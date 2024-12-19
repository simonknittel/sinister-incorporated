import { authenticateApi } from "@/auth/server";
import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { saveObject } from "../../../../lib/algolia";
import apiErrorHandler from "../../../../lib/apiErrorHandler";

const postBodySchema = z.object({
  type: z.literal("citizen"),
  spectrumId: z.string().trim(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi("/api/spynet/entity", "POST");
    authentication.authorizeApi("citizen", "create");

    /**
     * Validate the request
     */
    const body: unknown = await request.json();
    const data = postBodySchema.parse(body);

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
            createdBy: {
              connect: {
                id: authentication.session.user.id,
              },
            },
            spectrumId: data.spectrumId,
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
    return apiErrorHandler(error);
  }
}
