import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteObject } from "../../../../../lib/algolia";
import { authenticateApi } from "../../../../../lib/auth/authenticateAndAuthorize";
import { requireConfirmedEmailForApi } from "../../../../../lib/emailConfirmation";
import { prisma } from "../../../../../server/db";
import errorHandler from "../../../_lib/errorHandler";

interface Params {
  id: string;
}

const paramsSchema = z.string().cuid2();

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi();
    await requireConfirmedEmailForApi(authentication.session);
    authentication.authorizeApi([
      {
        resource: "citizen",
        operation: "delete",
      },
    ]);

    /**
     * Validate the request params
     */
    const paramsData = await paramsSchema.parseAsync(params.id);

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
    return errorHandler(error);
  }
}
