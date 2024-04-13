import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "../../../../lib/auth/server";
import { prisma } from "../../../../server/db";
import errorHandler from "../../_lib/errorHandler";

interface Params {
  id: string;
}

const paramsSchema = z.string().cuid2();

const patchBodySchema = z.object({
  name: z.string().trim().min(1),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi(
      "/api/manufacturer/[id]",
      "PATCH",
    );
    authentication.authorizeApi("manufacturersSeriesAndVariants", "manage");

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
    const item = await prisma.manufacturer.findUnique({
      where: {
        id: paramsData,
      },
    });
    if (!item) throw new Error("Not found");

    /**
     * Update
     */
    const updatedItem = await prisma.manufacturer.update({
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

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi(
      "/api/manufacturer/[id]",
      "DELETE",
    );
    authentication.authorizeApi("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request params
     */
    const paramsData = paramsSchema.parse(params.id);

    /**
     * Make sure the item exists.
     */
    const item = await prisma.manufacturer.findUnique({
      where: {
        id: paramsData,
      },
    });
    if (!item) throw new Error("Not found");

    /**
     * Delete
     */
    await prisma.manufacturer.delete({
      where: {
        id: paramsData,
      },
    });

    return NextResponse.json({});
  } catch (error) {
    return errorHandler(error);
  }
}
