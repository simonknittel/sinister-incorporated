import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "~/server/db";
import { authenticateAndAuthorizeApi } from "../../_utils/authenticateAndAuthorize";
import errorHandler from "../_utils/errorHandler";

const postBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate and authorize the request
     */
    await authenticateAndAuthorizeApi("edit-roles-and-permissions");

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = await postBodySchema.parseAsync(body);

    /**
     * Do the thing
     */
    const item = await prisma.role.create({
      data,
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
