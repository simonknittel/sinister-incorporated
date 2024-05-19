import { VariantStatus } from "@prisma/client";
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
  status: z
    .enum([VariantStatus.FLIGHT_READY, VariantStatus.NOT_FLIGHT_READY])
    .optional(),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi("/api/variant/[id]", "PATCH");
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

    /**
     * Revalidate cache(s)
     */
    revalidateTag("variant");
    revalidateTag(`variant:${updatedItem.id}`);
    revalidateTag(`series:${updatedItem.seriesId}`);

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
    const authentication = await authenticateApi("/api/variant/[id]", "DELETE");
    authentication.authorizeApi("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request params
     */
    const paramsData = paramsSchema.parse(params.id);

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
    const deletedItem = await prisma.variant.delete({
      where: {
        id: paramsData,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidateTag("variant");
    revalidateTag(`variant:${deletedItem.id}`);
    revalidateTag(`series:${deletedItem.seriesId}`);

    return NextResponse.json({});
  } catch (error) {
    return apiErrorHandler(error);
  }
}
