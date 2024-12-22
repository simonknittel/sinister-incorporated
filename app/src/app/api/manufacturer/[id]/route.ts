import { authenticateApi } from "@/auth/server";
import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Make sure this file matches `/src/lib/serverActions/manufacturer.ts`.
 */

interface Params {
  id: string;
}

const paramsSchema = z.object({ id: z.string().cuid() });

const patchBodySchema = z.object({
  imageId: z.string().trim().min(1).max(255),
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
     * Validate the request params and body
     */
    const paramsData = paramsSchema.parse(params);
    const body: unknown = await request.json();
    const data = patchBodySchema.parse(body);

    /**
     * Make sure the item exists.
     */
    const existingItem = await prisma.manufacturer.findUnique({
      where: {
        id: paramsData.id,
      },
    });
    if (!existingItem) throw new Error("Not found");

    /**
     * Update
     */
    const updatedItem = await prisma.manufacturer.update({
      where: {
        id: paramsData.id,
      },
      data,
    });

    /**
     * Revalidate cache(s)
     */
    revalidateTag("manufacturer");
    revalidateTag(`manufacturer:${updatedItem.id}`);

    /**
     * Respond with the result
     */
    return NextResponse.json(updatedItem);
  } catch (error) {
    return apiErrorHandler(error);
  }
}
