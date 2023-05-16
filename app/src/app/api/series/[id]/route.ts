import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import { authorize } from "../../_utils/authorize";
import errorHandler from "../../_utils/errorHandler";

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
     * Authenticate the request.
     */
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    /**
     * Authorize the request.
     */
    authorize(session, "update-series");

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
    const item = await prisma.series.findUnique({
      where: {
        id: paramsData,
      },
    });
    if (!item) throw new Error("Not found");

    /**
     * Update
     */
    const updatedItem = await prisma.series.update({
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
     * Authenticate the request. Make sure only authenticated users can create.
     */
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    /**
     * Authorize the request.
     */
    authorize(session, "delete", "Series");

    /**
     * Validate the request params
     */
    const paramsData = await deleteParamsSchema.parseAsync(params.id);

    /**
     * Make sure the item exists.
     */
    const item = await prisma.series.findUnique({
      where: {
        id: paramsData,
      },
    });
    if (!item) throw new Error("Not found");

    /**
     * Delete
     */
    await prisma.series.delete({
      where: {
        id: paramsData,
      },
    });

    return NextResponse.json({});
  } catch (error) {
    return errorHandler(error);
  }
}
