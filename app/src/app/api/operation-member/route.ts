import { authenticateApi } from "@/auth/server";
import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import apiErrorHandler from "../../../lib/apiErrorHandler";

const postBodySchema = z.union([
  z.object({
    operationId: z.string().cuid2(),
    status: z.literal("pending"),
  }),
  z.object({
    operationId: z.string().cuid2(),
    status: z.literal("confirmed"),
    operationUnitId: z.string().cuid2(),
    title: z.string().min(1).max(255),
    shipId: z.string().cuid2(),
  }),
]);

export async function POST(request: Request) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi(
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
