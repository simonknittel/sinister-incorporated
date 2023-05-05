import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import errorHandler from "../_utils/errorHandler";

const postBodySchema = z.object({
  variantId: z.string().cuid2(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate the request.
     */
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = await postBodySchema.parseAsync(body);

    /**
     * Do the thing
     */
    const existingOwnership = await prisma.fleetOwnership.findFirst({
      where: {
        variantId: data.variantId,
        userId: session.user.id,
      },
    });

    let item;

    if (existingOwnership) {
      item = await prisma.fleetOwnership.update({
        where: {
          userId_variantId: {
            variantId: data.variantId,
            userId: session.user.id,
          },
        },
        data: {
          count: existingOwnership.count + 1,
        },
      });
    } else {
      item = await prisma.fleetOwnership.create({
        data: {
          variantId: data.variantId,
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(item);
  } catch (error) {
    return errorHandler(error);
  }
}
