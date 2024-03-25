import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "../../../_lib/auth/authenticateAndAuthorize";
import { requireConfirmedEmailForApi } from "../../../_lib/emailConfirmation";
import { prisma } from "../../../server/db";
import errorHandler from "../_lib/errorHandler";

const postBodySchema = z.object({
  name: z.string().trim().min(1),
  manufacturerId: z.string(),
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
        resource: "manufacturersSeriesAndVariants",
        operation: "manage",
      },
    ]);

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
