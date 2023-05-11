import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import { authorize } from "../_utils/authorize";
import errorHandler from "../_utils/errorHandler";

const postBodySchema = z.object({
  name: z.string().trim().min(1),
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
    authorize(session.user, "create", "Manufacturer");

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = await postBodySchema.parseAsync(body);

    /**
     * Create
     */
    const createdItem = await prisma.manufacturer.create({
      data: {
        name: data.name,
      },
    });

    return NextResponse.json(createdItem);
  } catch (error) {
    return errorHandler(error);
  }
}
