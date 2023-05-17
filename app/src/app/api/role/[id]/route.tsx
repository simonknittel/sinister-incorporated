import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import errorHandler from "~/app/api/_utils/errorHandler";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import { authorizeApi } from "../../../_utils/authorize";

interface Params {
  id: string;
}

const deleteParamsSchema = z.string().cuid2();

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request. Make sure only authenticated users can create.
     */
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    /**
     * Authorize the request.
     */
    authorizeApi("edit-roles-and-permissions", session);

    /**
     * Validate the request params
     */
    const paramsData = await deleteParamsSchema.parseAsync(params.id);

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
