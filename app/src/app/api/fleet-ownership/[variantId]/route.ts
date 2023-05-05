import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import errorHandler from "../../_utils/errorHandler";

interface Params {
  variantId: string;
}

const deleteParamsSchema = z.string().cuid2();

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request.
     */
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    /**
     * Validate the request params
     */
    const paramsData = await deleteParamsSchema.parseAsync(params.variantId);

    /**
     * Do the thing
     */
    const existingOwnership = await prisma.fleetOwnership.findFirst({
      where: {
        variantId: paramsData,
        userId: session.user.id,
      },
    });

    let item;

    if (existingOwnership && existingOwnership.count > 1) {
      item = await prisma.fleetOwnership.update({
        where: {
          userId_variantId: {
            variantId: paramsData,
            userId: session.user.id,
          },
        },
        data: {
          count: existingOwnership.count - 1,
        },
      });
    } else {
      item = await prisma.fleetOwnership.delete({
        where: {
          userId_variantId: {
            variantId: paramsData,
            userId: session.user.id,
          },
        },
      });
    }

    return NextResponse.json(item);
  } catch (error) {
    return errorHandler(error);
  }
}
