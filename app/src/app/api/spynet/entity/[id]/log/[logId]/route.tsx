import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import errorHandler from "~/app/api/_utils/errorHandler";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";

interface Params {
  id: string;
  logId: string;
}

const patchParamsSchema = z.string().cuid2();

const patchBodySchema = z.object({
  confirmed: z.literal(true),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request.
     */
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    /**
     * Validate the request params
     */
    const paramsData = await patchParamsSchema.parseAsync(params.id);

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = await patchBodySchema.parseAsync(body);

    /**
     * Do the thing
     */
    const entity = await prisma.entity.findFirst({
      where: {
        id: paramsData,
      },
    });

    if (!entity) throw new Error("Not found");

    const item = await prisma.entityLog.update({
      where: {
        id: params.logId,
      },
      data: {
        confirmed: new Date(),
        confirmer: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return errorHandler(error);
  }
}
