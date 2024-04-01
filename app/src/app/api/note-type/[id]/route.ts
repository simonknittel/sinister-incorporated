import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "../../../../lib/auth/authenticateAndAuthorize";
import { prisma } from "../../../../server/db";
import errorHandler from "../../_lib/errorHandler";

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
      "/api/note-type/[id]",
      "PATCH",
    );
    authentication.authorizeApi("noteType", "manage");

    /**
     * Validate the request params and body
     */
    const paramsData = paramsSchema.parse(params);
    const body: unknown = await request.json();
    const data = patchBodySchema.parse(body);

    /**
     * Do the thing
     */
    const item = await prisma.noteType.update({
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
    return errorHandler(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi(
      "/api/note-type/[id]",
      "DELETE",
    );
    authentication.authorizeApi("noteType", "manage");

    /**
     * Validate the request params
     */
    const paramsData = paramsSchema.parse(params);

    /**
     * Do the thing
     */
    await prisma.noteType.delete({
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
    return errorHandler(error);
  }
}
