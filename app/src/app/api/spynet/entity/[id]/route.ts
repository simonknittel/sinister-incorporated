import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteObject } from "../../../../../lib/algolia";
import apiErrorHandler from "../../../../../lib/apiErrorHandler";
import { authenticateApi } from "../../../../../lib/auth/server";
import { prisma } from "../../../../../server/db";

interface Params {
  id: string;
}

const paramsSchema = z.string().cuid2();

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi(
      "/api/spynet/entity/[id]",
      "DELETE",
    );
    authentication.authorizeApi("citizen", "delete");

    /**
     * Validate the request params
     */
    const paramsData = paramsSchema.parse(params.id);

    /**
     * Delete
     */
    await prisma.entity.delete({
      where: {
        id: paramsData,
      },
    });

    // TODO: Update name field of user corresponding use entry

    /**
     * Delete entity from Algolia
     */
    await deleteObject(paramsData);

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
