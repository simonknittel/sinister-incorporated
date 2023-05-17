import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "~/app/_utils/authorize";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import errorHandler from "../_utils/errorHandler";

const postBodySchema = z.object({
  variantId: z.string().cuid2(),
  name: z.string().trim().max(255).optional(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate the request.
     */
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    /**
     * Authorize the request.
     */
    authorizeApi("add-ship", session);

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = await postBodySchema.parseAsync(body);

    /**
     * Do the thing
     */
    const item = await prisma.ship.create({
      data: {
        ownerId: session.user.id,
        ...data,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return errorHandler(error);
  }
}
