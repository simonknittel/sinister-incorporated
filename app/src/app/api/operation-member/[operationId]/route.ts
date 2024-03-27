import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "../../../../lib/auth/authenticateAndAuthorize";
import { requireConfirmedEmailForApi } from "../../../../lib/emailConfirmation";
import { prisma } from "../../../../server/db";
import errorHandler from "../../_lib/errorHandler";

interface Params {
  operationId: string;
}

const paramsSchema = z.string().cuid2();

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi();
    await requireConfirmedEmailForApi(authentication.session);

    /**
     * Validate the request params
     */
    const paramsData = paramsSchema.parse(params.operationId);

    /**
     * Get
     */
    const items = await prisma.operationMember.findMany({
      where: {
        operationId: paramsData,
      },
      include: {
        user: {
          include: {
            ships: {
              include: {
                variant: true,
              },
            },
          },
        },
      },
    });

    /**
     * Respond with the result
     */
    return NextResponse.json(items);
  } catch (error) {
    /**
     * Respond with an error
     */
    return errorHandler(error);
  }
}

const patchBodySchema = z.object({
  status: z.literal("confirmed").optional(),
  operationUnitId: z.string().cuid2().optional(),
  title: z.string().trim().min(1).max(255).optional(),
  userId: z.string().cuid2(),
  shipId: z.string().cuid2().optional(),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi();
    await requireConfirmedEmailForApi(authentication.session);

    /**
     * Validate the request params
     */
    const paramsData = paramsSchema.parse(params.operationId);

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = patchBodySchema.parse(body);

    /**
     * Make sure the item exists.
     */
    const item = await prisma.operationMember.findUnique({
      where: {
        operationId_userId: {
          operationId: paramsData,
          userId: data.userId,
        },
      },
    });
    if (!item) throw new Error("Not found");

    /**
     * Update
     */
    const updatedItem = await prisma.operationMember.update({
      where: {
        operationId_userId: {
          operationId: paramsData,
          userId: data.userId,
        },
      },
      data,
    });

    /**
     * Respond with the result
     */
    return NextResponse.json(updatedItem);
  } catch (error) {
    /**
     * Respond with an error
     */
    return errorHandler(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi();
    await requireConfirmedEmailForApi(authentication.session);

    /**
     * Validate the request params
     */
    const paramsData = paramsSchema.parse(params.operationId);

    /**
     * Delete
     */
    await prisma.operationMember.delete({
      where: {
        operationId_userId: {
          operationId: paramsData,
          userId: authentication.session.user.id,
        },
      },
    });

    /**
     * Respond with the result
     */
    return NextResponse.json({});
  } catch (error) {
    /**
     * Respond with an error
     */
    return errorHandler(error);
  }
}
