import { requireAuthenticationApi } from "@/auth/server";
import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const postBodySchema = z.object({
  operationId: z.cuid(),
  title: z.string().min(1).max(255),
  type: z.union([
    z.literal("squadron"),
    z.literal("squadron-flight"),
    z.literal("squad"),
    z.literal("squad-fireteam"),
    z.literal("other"),
  ]),
  parentUnitId: z.cuid().optional(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate the request
     */
    await requireAuthenticationApi("/api/operation-unit", "POST");

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
    return apiErrorHandler(error);
  }
}
