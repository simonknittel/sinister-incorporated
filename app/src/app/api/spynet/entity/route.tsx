import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
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
        submitter: {
          connect: {
            id: session.user.id,
          },
        },
        entity: {
          create: {
            type: data.type,
            creator: {
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

    return NextResponse.json(item.entity);
  } catch (error) {
    return errorHandler(error);
  }
}
