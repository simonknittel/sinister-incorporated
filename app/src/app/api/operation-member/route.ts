import { prisma } from "@/db";
import { requireAuthenticationApi } from "@/modules/auth/server";
import apiErrorHandler from "@/modules/common/utils/apiErrorHandler";
import { NextResponse } from "next/server";
import { z } from "zod";

const postBodySchema = z.union([
  z.object({
    operationId: z.cuid(),
    status: z.literal("pending"),
  }),
  z.object({
    operationId: z.cuid(),
    status: z.literal("confirmed"),
    operationUnitId: z.cuid(),
    title: z.string().min(1).max(255),
    shipId: z.cuid(),
  }),
]);

export async function POST(request: Request) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await requireAuthenticationApi(
      "/api/operation-member",
      "POST",
    );

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = postBodySchema.parse(body);

    /**
     * Do the thing
     */
    let item;
    if (data.status === "confirmed") {
      const { operationId, operationUnitId, shipId, ...other } = data;
      item = await prisma.operationMember.create({
        data: {
          operation: {
            connect: {
              id: operationId,
            },
          },
          user: {
            connect: {
              id: authentication.session.user.id,
            },
          },
          operationUnit: {
            connect: {
              id: operationUnitId,
            },
          },
          ship: {
            connect: {
              id: shipId,
            },
          },
          ...other,
        },
      });
    } else {
      const { operationId, ...other } = data;
      item = await prisma.operationMember.create({
        data: {
          operation: {
            connect: {
              id: operationId,
            },
          },
          user: {
            connect: {
              id: authentication.session.user.id,
            },
          },
          ...other,
        },
      });
    }

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
