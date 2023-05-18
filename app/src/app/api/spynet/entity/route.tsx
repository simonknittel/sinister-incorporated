import algoliasearch from "algoliasearch";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import errorHandler from "../../_utils/errorHandler";

const postBodySchema = z.object({
  type: z.union([z.literal("citizen"), z.literal("organization")]),
  spectrumId: z.string().trim(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate the request.
     */
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

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
            id: session.user.id,
          },
        },
        entity: {
          create: {
            type: data.type,
            createdBy: {
              connect: {
                id: session.user.id,
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
    const client = algoliasearch(
      env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      env.ALGOLIA_ADMIN_API_KEY
    );
    const index = client.initIndex("spynet_entities");
    void index.saveObject({
      objectID: item.entityId,
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
