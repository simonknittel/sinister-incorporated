import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "../../../_lib/auth/authenticateAndAuthorize";
import { requireConfirmedEmailForApi } from "../../../_lib/emailConfirmation";
import { prisma } from "../../../server/db";
import errorHandler from "../_lib/errorHandler";

const postBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi();
    await requireConfirmedEmailForApi(authentication.session);
    authentication.authorizeApi([
      {
        resource: "role",
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
