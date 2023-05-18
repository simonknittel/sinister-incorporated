import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAndAuthorize } from "~/app/_utils/authenticateAndAuthorize";
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
  z.object({
    type: z.literal("role-added"),
    content: z.string().cuid2(),
  }),
  z.object({
    type: z.literal("role-removed"),
    content: z.string().cuid2(),
  }),
]);

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request
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
     * Authenticate the request
     */
    switch (data.type) {
      case "handle":
        await authenticateAndAuthorize("add-handle");
        break;
      case "note":
        await authenticateAndAuthorize("add-note");
        break;
      case "discord-id":
        await authenticateAndAuthorize("add-discord-id");
        break;
      case "role-added":
        await authenticateAndAuthorize("edit-roles-and-permissions");
        break;
      case "role-removed":
        await authenticateAndAuthorize("edit-roles-and-permissions");
        break;
    }

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
