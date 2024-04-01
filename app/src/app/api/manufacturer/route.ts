import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "../../../lib/auth/authenticateAndAuthorize";
import { prisma } from "../../../server/db";
import errorHandler from "../_lib/errorHandler";

const postBodySchema = z.object({
  name: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi("/api/manufacturer", "POST");
    authentication.authorizeApi("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = postBodySchema.parse(body);

    /**
     * Create
     */
    const createdItem = await prisma.manufacturer.create({
      data: {
        name: data.name,
      },
    });

    return NextResponse.json(createdItem);
  } catch (error) {
    return errorHandler(error);
  }
}
