import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "~/server/db";
import { authenticateAndAuthorizeApi } from "../../../_utils/authenticateAndAuthorize";
import errorHandler from "../../_lib/errorHandler";

interface Params {
  id: string;
}

const patchParamsSchema = z.string().cuid2();

const patchBodySchema = z.object({
  name: z.string().trim().min(1),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    await authenticateAndAuthorizeApi("edit-manufacturers-series-and-variants");

    /**
     * Validate the request params
     */
    const paramsData = await patchParamsSchema.parseAsync(params.id);

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = await patchBodySchema.parseAsync(body);

    /**
     * Make sure the item exists.
     */
    const item = await prisma.variant.findUnique({
      where: {
        id: paramsData,
      },
    });
    if (!item) throw new Error("Not found");

    /**
     * Update
     */
    const updatedItem = await prisma.variant.update({
      where: {
        id: params.id,
      },
      data,
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return errorHandler(error);
  }
}

const deleteParamsSchema = z.string().cuid2();

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    await authenticateAndAuthorizeApi("edit-manufacturers-series-and-variants");

    /**
     * Validate the request params
     */
    const paramsData = await deleteParamsSchema.parseAsync(params.id);

    /**
     * Make sure the item exists.
     */
    const item = await prisma.variant.findUnique({
      where: {
        id: paramsData,
      },
    });
    if (!item) throw new Error("Not found");

    /**
     * Delete
     */
    await prisma.variant.delete({
      where: {
        id: paramsData,
      },
    });

    return NextResponse.json({});
  } catch (error) {
    return errorHandler(error);
  }
}
