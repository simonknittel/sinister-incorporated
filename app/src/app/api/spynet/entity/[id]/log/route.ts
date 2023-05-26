import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "~/app/_lib/auth/authenticateAndAuthorize";
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
    noteTypeId: z.string().trim().cuid2(),
    classificationLevelId: z.string().trim().cuid2(),
  }),
  z.object({
    type: z.literal("discordId"),
    content: z.string().trim().min(1).max(255),
  }),
  z.object({
    type: z.literal("role-added"),
    content: z.string().trim().cuid2(),
  }),
  z.object({
    type: z.literal("role-removed"),
    content: z.string().trim().cuid2(),
  }),
]);

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi();

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
        authentication.authorizeApi([
          {
            resource: "handle",
            operation: "create",
          },
        ]);
        break;
      case "note":
        authentication.authorizeApi([
          {
            resource: "note",
            operation: "create",
            attributes: [
              {
                key: "noteTypeId",
                value: data.noteTypeId,
              },
              {
                key: "classificationLevelId",
                value: data.classificationLevelId,
              },
            ],
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
      case "role-added":
        authentication.authorizeApi([
          {
            resource: "otherRole",
            operation: "assign",
            attributes: [
              {
                key: "roleId",
                value: data.content,
              },
            ],
          },
        ]);
        break;
      case "role-removed":
        authentication.authorizeApi([
          {
            resource: "otherRole",
            operation: "dismiss",
            attributes: [
              {
                key: "roleId",
                value: data.content,
              },
            ],
          },
        ]);
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
            id: authentication.session.user.id,
          },
        },
        entity: {
          connect: {
            id: entity.id,
          },
        },
        attributes:
          "noteTypeId" in data
            ? {
                createMany: {
                  data: [
                    {
                      key: "noteTypeId",
                      value: data.noteTypeId,
                      createdById: authentication.session.user.id,
                    },
                    {
                      key: "classificationLevelId",
                      value: data.classificationLevelId,
                      createdById: authentication.session.user.id,
                    },
                  ],
                },
              }
            : undefined,
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
