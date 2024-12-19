import { authenticateApi } from "@/auth/server";
import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import apiErrorHandler from "../../../lib/apiErrorHandler";

const postBodySchema = z.object({
  variantId: z.string().cuid2(),
  name: z.string().trim().max(255).optional(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi("/api/ship", "POST");
    authentication.authorizeApi("ship", "manage");

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = postBodySchema.parse(body);

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
    return apiErrorHandler(error);
  }
}
