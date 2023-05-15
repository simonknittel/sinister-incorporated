import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import errorHandler from "~/app/api/_utils/errorHandler";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";

interface Params {
  id: string;
}

const postParamsSchema = z.string().cuid2();

const postBodySchema = z.union([
  z.object({
    type: z.literal("handle"),
    content: z.string().trim().min(1).max(255),
  }),
  z.object({
    type: z.literal("note"),
    content: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal("discord-id"),
    content: z.string().trim().min(1).max(255),
  }),
]);

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request.
     */
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    /**
     * Validate the request params
     */
    const paramsData = await postParamsSchema.parseAsync(params.id);

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = await postBodySchema.parseAsync(body);

    /**
     * Do the thing
     */
    const entity = await prisma.entity.findFirst({
      where: {
        id: paramsData,
      },
    });

    if (!entity) throw new Error("Not found");

    const item = await prisma.entityLog.create({
      data: {
        type: data.type,
        content: data.content,
        submittedBy: {
          connect: {
            id: session.user.id,
          },
        },
        entity: {
          connect: {
            id: entity.id,
          },
        },
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return errorHandler(error);
  }
}
