import { NextResponse } from "next/server";
import { z } from "zod";
import apiErrorHandler from "../../../../lib/apiErrorHandler";
import { authenticateApi } from "../../../../lib/auth/server";
import { prisma } from "../../../../server/db";

interface Params {
  id: string;
}

const paramsSchema = z.object({ id: z.string().cuid2() });

const patchBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi(
      "/api/classification-level/[id]",
      "PATCH",
    );
    authentication.authorizeApi("classificationLevel", "manage");

    /**
     * Validate the request params and body
     */
    const paramsData = paramsSchema.parse(params);
    const body: unknown = await request.json();
    const data = patchBodySchema.parse(body);

    /**
     * Do the thing
     */
    const item = await prisma.classificationLevel.update({
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
    const authentication = await authenticateApi(
      "/api/classification-level/[id]",
      "DELETE",
    );
    authentication.authorizeApi("classificationLevel", "manage");

    /**
     * Validate the request params
     */
    const paramsData = paramsSchema.parse(params);

    /**
     * Do the thing
     */
    await prisma.classificationLevel.delete({
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
