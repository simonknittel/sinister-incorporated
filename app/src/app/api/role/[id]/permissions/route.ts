import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "~/_lib/auth/authenticateAndAuthorize";
import formValuesToPrismaOperations from "~/_lib/auth/formValuesToPrismaOperations";
import postBodySchema from "~/_lib/auth/postBodySchema";
import errorHandler from "~/app/api/_lib/errorHandler";
import { prisma } from "~/server/db";

interface Params {
  id: string;
}

const paramsSchema = z.object({ id: z.string().cuid2() });

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi();
    authentication.authorizeApi([
      {
        resource: "role",
        operation: "manage",
      },
    ]);

    /**
     * Validate the request params and body
     */
    const paramsData = await paramsSchema.parseAsync(params);
    const body: unknown = await request.json();
    const data = await postBodySchema.parseAsync(body);

    /**
     * Do the thing
     */
    await prisma.$transaction([
      prisma.permission.deleteMany({
        where: {
          roleId: paramsData.id,
        },
      }),

      ...formValuesToPrismaOperations(paramsData.id, data),
    ]);

    /**
     * Respond with the result
     */
    return NextResponse.json({});
  } catch (error) {
    /**
     * Respond with an error
     */
    return errorHandler(error);
  }
}
