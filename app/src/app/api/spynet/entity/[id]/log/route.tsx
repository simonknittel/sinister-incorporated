import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAndAuthorizeApi } from "~/app/_utils/authenticateAndAuthorize";
import errorHandler from "~/app/api/_lib/errorHandler";
import { prisma } from "~/server/db";

interface Params {
  id: string;
}

const paramsSchema = z.string().cuid2();

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
    const session = await authenticateAndAuthorizeApi();

    /**
     * Validate the request params
     */
    const paramsData = await paramsSchema.parseAsync(params.id);

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
        await authenticateAndAuthorizeApi("add-handle");
        break;
      case "note":
        await authenticateAndAuthorizeApi("add-note");
        break;
      case "discord-id":
        await authenticateAndAuthorizeApi("add-discord-id");
        break;
      case "role-added":
        await authenticateAndAuthorizeApi("edit-roles-and-permissions");
        break;
      case "role-removed":
        await authenticateAndAuthorizeApi("edit-roles-and-permissions");
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
