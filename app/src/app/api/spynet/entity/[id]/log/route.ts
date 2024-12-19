import { authenticateApi } from "@/auth/server";
import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import apiErrorHandler from "../../../../../../lib/apiErrorHandler";
import { updateEntityRolesCache } from "./_lib/updateEntityRolesCache";

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
    type: z.literal("teamspeak-id"),
    content: z.string().trim().min(1).max(255),
  }),
  z.object({
    type: z.literal("note"),
    content: z.string().trim().min(1),
    noteTypeId: z.string().trim().cuid2(),
    classificationLevelId: z.string().trim().cuid2(),
  }),
  z.object({
    type: z.literal("discord-id"),
    content: z.string().trim().min(1).max(255),
  }),
  z.object({
    type: z.literal("citizen-id"),
    content: z.string().trim().min(1).max(255),
  }),
  z.object({
    type: z.literal("community-moniker"),
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
    const authentication = await authenticateApi(
      "/api/spynet/entity/[id]/log",
      "POST",
    );

    /**
     * Validate the request
     */
    const paramsData = paramsSchema.parse(params.id);
    const body: unknown = await request.json();
    const data = postBodySchema.parse(body);

    /**
     * Authorize the request
     */
    switch (data.type) {
      case "handle":
        authentication.authorizeApi("handle", "create");
        break;
      case "teamspeak-id":
        authentication.authorizeApi("teamspeak-id", "create");
        break;
      case "note":
        authentication.authorizeApi("note", "create", [
          {
            key: "noteTypeId",
            value: data.noteTypeId,
          },
          {
            key: "classificationLevelId",
            value: data.classificationLevelId,
          },
        ]);
        break;
      case "discord-id":
        authentication.authorizeApi("discord-id", "create");
        break;
      case "citizen-id":
        authentication.authorizeApi("citizen-id", "create");
        break;
      case "community-moniker":
        authentication.authorizeApi("community-moniker", "create");
        break;
      case "role-added":
        authentication.authorizeApi("otherRole", "assign", [
          {
            key: "roleId",
            value: data.content,
          },
        ]);
        break;
      case "role-removed":
        authentication.authorizeApi("otherRole", "dismiss", [
          {
            key: "roleId",
            value: data.content,
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

    if (["role-added", "role-removed"].includes(data.type))
      await updateEntityRolesCache(entity.id);

    /**
     * Respond with the result
     */
    return NextResponse.json(item);
  } catch (error) {
    /**
     * Respond with an error
     */
    return apiErrorHandler(error);
  }
}
