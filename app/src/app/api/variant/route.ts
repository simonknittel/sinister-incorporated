import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "../../../lib/auth/authenticateAndAuthorize";
import { prisma } from "../../../server/db";
import errorHandler from "../_lib/errorHandler";

const postBodySchema = z.object({
  name: z.string().trim().min(1),
  seriesId: z.string(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi("/api/variant", "POST");
    authentication.authorizeApi("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = postBodySchema.parse(body);

    /**
     * Create
     */
    const createdItem = await prisma.variant.create({
      data: {
        name: data.name,
        series: {
          connect: {
            id: data.seriesId,
          },
        },
      },
    });

    return NextResponse.json(createdItem);
  } catch (error) {
    return errorHandler(error);
  }
}
