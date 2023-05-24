import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "~/app/_lib/auth/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import errorHandler from "../_lib/errorHandler";

const postBodySchema = z.object({
  variantId: z.string().cuid2(),
  name: z.string().trim().max(255).optional(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi();
    authentication.authorizeApi([
      {
        resource: "ship",
        operation: "manage",
      },
    ]);

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
        ownerId: authentication.session.user.id,
        ...data,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return errorHandler(error);
  }
}
