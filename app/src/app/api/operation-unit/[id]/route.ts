import { prisma } from "@/db";
import { requireAuthenticationApi } from "@/modules/auth/server";
import apiErrorHandler from "@/modules/common/utils/apiErrorHandler";
import { NextResponse } from "next/server";
import { z } from "zod";

type Params = Promise<{
  id: string;
}>;

const paramsSchema = z.cuid();

const patchBodySchema = z.object({
  title: z.string().min(1).max(255),
});

export async function PATCH(request: Request, props: { params: Params }) {
  try {
    /**
     * Authenticate the request
     */
    await requireAuthenticationApi("/api/operation-unit/[id]", "PATCH");

    /**
     * Validate the request params
     */
    const paramsData = paramsSchema.parse((await props.params).id);

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
    return apiErrorHandler(error);
  }
}

export async function DELETE(request: Request, props: { params: Params }) {
  try {
    /**
     * Authenticate the request
     */
    await requireAuthenticationApi("/api/operation-unit/[id]", "DELETE");

    /**
     * Validate the request params
     */
    const paramsData = paramsSchema.parse((await props.params).id);

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
    return apiErrorHandler(error);
  }
}
