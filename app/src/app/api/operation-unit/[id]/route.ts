import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "../../../../lib/auth/authenticateAndAuthorize";
import { requireConfirmedEmailForApi } from "../../../../lib/emailConfirmation";
import { prisma } from "../../../../server/db";
import errorHandler from "../../_lib/errorHandler";

interface Params {
  id: string;
}

const paramsSchema = z.string().cuid2();

const patchBodySchema = z.object({
  title: z.string().min(1).max(255),
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
    const paramsData = paramsSchema.parse(params.id);

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = patchBodySchema.parse(body);

    /**
     * Make sure the item exists.
     */
    const item = await prisma.operationUnit.findUnique({
      where: {
        id: paramsData,
      },
    });
    if (!item) throw new Error("Not found");

    /**
     * Update
     */
    const updatedItem = await prisma.operationUnit.update({
      where: {
        id: paramsData,
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
    const paramsData = paramsSchema.parse(params.id);

    /**
     * Delete
     */
    await prisma.operationUnit.delete({
      where: {
        id: paramsData,
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
