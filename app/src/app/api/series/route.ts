import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "~/server/db";
import { authenticateAndAuthorizeApi } from "../../_utils/authenticateAndAuthorize";
import errorHandler from "../_utils/errorHandler";

const postBodySchema = z.object({
  name: z.string().trim().min(1),
  manufacturerId: z.string(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate and authorize the request
     */
    await authenticateAndAuthorizeApi("edit-manufacturers-series-and-variants");

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = await postBodySchema.parseAsync(body);

    /**
     * Create
     */
    const createdItem = await prisma.series.create({
      data: {
        name: data.name,
        manufacturer: {
          connect: {
            id: data.manufacturerId,
          },
        },
      },
    });

    return NextResponse.json(createdItem);
  } catch (error) {
    return errorHandler(error);
  }
}
