import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import { authorize } from "../_utils/authorize";
import errorHandler from "../_utils/errorHandler";

const postBodySchema = z.object({
  name: z.string(),
  manufacturerId: z.string(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate the request.
     */
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    /**
     * Authorize the request.
     */
    authorize(session.user, "create", "Series");

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
