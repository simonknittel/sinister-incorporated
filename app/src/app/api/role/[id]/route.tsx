import { NextResponse } from "next/server";
import { z } from "zod";
import errorHandler from "~/app/api/_lib/errorHandler";
import { prisma } from "~/server/db";
import { authenticateAndAuthorizeApi } from "../../../_utils/authenticateAndAuthorize";

interface Params {
  id: string;
}

const paramsSchema = z.string().cuid2();

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    await authenticateAndAuthorizeApi("edit-roles-and-permissions");

    /**
     * Validate the request params
     */
    const paramsData = await paramsSchema.parseAsync(params.id);

    /**
     * Delete
     */
    await prisma.role.delete({
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
    return errorHandler(error);
  }
}
