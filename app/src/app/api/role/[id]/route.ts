import { authenticateApi } from "@/auth/server";
import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { z } from "zod";

interface Params {
  id: string;
}

const paramsSchema = z.object({ id: z.string().cuid() });

const patchBodySchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  imageId: z.string().trim().min(1).max(255).optional(),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi("/api/role/[id]", "PATCH");
    authentication.authorizeApi("role", "manage");

    /**
     * Validate the request params and body
     */
    const paramsData = paramsSchema.parse(params);
    const body: unknown = await request.json();
    const data = patchBodySchema.parse(body);

    /**
     * Do the thing
     */
    const item = await prisma.role.update({
      where: {
        id: paramsData.id,
      },
      data,
    });

    /**
     * Respond with the result
     */
    return NextResponse.json(item);
  } catch (error) {
    /**
     * Respond with an error
     */
    return apiErrorHandler(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi("/api/role/[id]", "DELETE");
    authentication.authorizeApi("role", "manage");

    /**
     * Validate the request params
     */
    const paramsData = paramsSchema.parse(params);

    /**
     * Delete
     */
    await prisma.role.delete({
      where: {
        id: paramsData.id,
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
