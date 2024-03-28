import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "../../../lib/auth/authenticateAndAuthorize";
import { requireConfirmedEmailForApi } from "../../../lib/emailConfirmation";
import { prisma } from "../../../server/db";
import errorHandler from "../_lib/errorHandler";

const postBodySchema = z.object({
  title: z.string().trim().min(1).max(255),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi();
    await requireConfirmedEmailForApi(authentication.session);

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = postBodySchema.parse(body);

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
