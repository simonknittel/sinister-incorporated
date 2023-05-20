import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAndAuthorizeApi } from "~/app/_utils/authenticateAndAuthorize";
import { deleteObject } from "~/app/api/_lib/algolia";
import errorHandler from "~/app/api/_lib/errorHandler";
import { prisma } from "~/server/db";

interface Params {
  id: string;
}

const deleteParamsSchema = z.string().cuid2();

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    await authenticateAndAuthorizeApi("delete-entity");

    /**
     * Validate the request params
     */
    const paramsData = await deleteParamsSchema.parseAsync(params.id);

    /**
     * Delete
     */
    await prisma.entity.delete({
      where: {
        id: paramsData,
      },
    });

    // TODO: Also delete name field for matching user entry

    /**
     * Delete entity from Algolia
     */
    void deleteObject(paramsData);

    /**
     * Respond with the result
     */
    return NextResponse.json({});
  } catch (error) {
    /**
     * Respond with an error
     */
    return errorHandler(error);
  }
}
