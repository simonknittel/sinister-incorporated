import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAndAuthorizeApi } from "~/app/_utils/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import errorHandler from "../../_lib/errorHandler";

interface Params {
  id: string;
}

const paramsSchema = z.string().cuid2();

const patchBodySchema = z.object({
  name: z.string().trim().optional(),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const session = await authenticateAndAuthorizeApi("add-ship");

    /**
     * Validate the request params
     */
    const paramsData = await paramsSchema.parseAsync(params.id);

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = await patchBodySchema.parseAsync(body);

    /**
     * Make sure the item exists.
     */
    const item = await prisma.ship.findMany({
      where: {
        id: paramsData,
        ownerId: session.user.id,
      },
    });
    if (item.length <= 0) throw new Error("Not found");

    /**
     * Update
     */
    const updatedItem = await prisma.ship.updateMany({
      where: {
        id: params.id,
        ownerId: session.user.id,
      },
      data: {
        name: data.name,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return errorHandler(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const session = await authenticateAndAuthorizeApi("add-ship");

    /**
     * Validate the request params
     */
    const paramsData = await paramsSchema.parseAsync(params.id);

    /**
     * Delete
     */
    await prisma.ship.deleteMany({
      where: {
        id: paramsData,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json({});
  } catch (error) {
    return errorHandler(error);
  }
}
