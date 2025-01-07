import { authenticateApi } from "@/auth/server";
import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { z } from "zod";

type Params = Promise<{
  id: string;
}>;

const paramsSchema = z.object({ id: z.string().cuid() });

const patchBodySchema = z.object({
  title: z.string().trim(),
});

export async function PATCH(request: Request, props: { params: Params }) {
  try {
    /**
     * Authenticate the request
     */
    await authenticateApi("/api/operation/[id]", "PATCH");

    /**
     * Validate the request params
     */
    const params = paramsSchema.parse(await props.params);

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = patchBodySchema.parse(body);

    /**
     * Update
     */
    const updatedItem = await prisma.operation.updateMany({
      where: {
        id: params.id,
      },
      data: {
        title: data.title,
      },
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
    await authenticateApi("/api/operation/[id]", "DELETE");

    /**
     * Validate the request params
     */
    const params = paramsSchema.parse(await props.params);

    /**
     * Delete
     */
    await prisma.operation.delete({
      where: {
        id: params.id,
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
