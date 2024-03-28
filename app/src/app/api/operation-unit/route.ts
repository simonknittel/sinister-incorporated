import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "../../../lib/auth/authenticateAndAuthorize";
import { requireConfirmedEmailForApi } from "../../../lib/emailConfirmation";
import { prisma } from "../../../server/db";
import errorHandler from "../_lib/errorHandler";

const postBodySchema = z.object({
  operationId: z.string().cuid2(),
  title: z.string().min(1).max(255),
  type: z.union([
    z.literal("squadron"),
    z.literal("squadron-flight"),
    z.literal("squad"),
    z.literal("squad-fireteam"),
    z.literal("other"),
  ]),
  parentUnitId: z.string().cuid2().optional(),
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
    const { operationId, parentUnitId, ...other } = data;
    const item = await prisma.operationUnit.create({
      data: {
        operation: {
          connect: {
            id: operationId,
          },
        },
        ...other,
        parentUnit: parentUnitId
          ? {
              connect: {
                id: parentUnitId,
              },
            }
          : undefined,
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
