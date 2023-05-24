import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "~/app/_lib/auth/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import errorHandler from "../_lib/errorHandler";

const postBodySchema = z.object({
  title: z.string().trim().min(1).max(255),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate the request
     */
    await authenticateApi();

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = await postBodySchema.parseAsync(body);

    /**
     * Do the thing
     */
    const item = await prisma.operation.create({
      data: {
        title: data.title,
      },
    });

    /**
     * Respond with the result
     */
    return NextResponse.json(item);
  } catch (error) {
    /**
     * Respond with an error
     */
    return errorHandler(error);
  }
}
