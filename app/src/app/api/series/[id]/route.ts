import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import apiErrorHandler from "../../../../lib/apiErrorHandler";
import { authenticateApi } from "../../../../lib/auth/server";
import { prisma } from "../../../../server/db";

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
    const authentication = await authenticateApi("/api/series/[id]", "PATCH");
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

    /**
     * Revalidate cache(s)
     */
    revalidateTag("series");
    revalidateTag(`series:${updatedItem.id}`);
    revalidateTag(`manufacturer:${updatedItem.manufacturerId}`);

    return NextResponse.json(updatedItem);
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi("/api/series/[id]", "DELETE");
    authentication.authorizeApi("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request params
     */
    const paramsData = paramsSchema.parse(params.id);

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
    const deletedItem = await prisma.series.delete({
      where: {
        id: paramsData,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidateTag("series");
    revalidateTag(`series:${deletedItem.id}`);
    revalidateTag(`manufacturer:${deletedItem.manufacturerId}`);

    return NextResponse.json({});
  } catch (error) {
    return apiErrorHandler(error);
  }
}
