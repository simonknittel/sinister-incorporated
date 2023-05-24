import { NextResponse } from "next/server";
import { z } from "zod";
import errorHandler from "~/app/api/_lib/errorHandler";
import { prisma } from "~/server/db";
import { authenticateApi } from "../../../_lib/auth/authenticateAndAuthorize";

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
    const authentication = await authenticateApi();
    authentication.authorizeApi([
      {
        resource: "noteType",
        operation: "manage",
      },
    ]);

    /**
     * Validate the request params and body
     */
    const paramsData = await paramsSchema.parseAsync(params);
    const body: unknown = await request.json();
    const data = await patchBodySchema.parseAsync(body);

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
    const authentication = await authenticateApi();
    authentication.authorizeApi([
      {
        resource: "noteType",
        operation: "manage",
      },
    ]);

    /**
     * Validate the request params
     */
    const paramsData = await paramsSchema.parseAsync(params);

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
