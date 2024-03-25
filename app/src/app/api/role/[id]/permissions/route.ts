import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "../../../../../lib/auth/authenticateAndAuthorize";
import formValuesToPrismaOperations from "../../../../../lib/auth/formValuesToPrismaOperations";
import postBodySchema from "../../../../../lib/auth/postBodySchema";
import { requireConfirmedEmailForApi } from "../../../../../lib/emailConfirmation";
import { prisma } from "../../../../../server/db";
import errorHandler from "../../../_lib/errorHandler";

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
    await requireConfirmedEmailForApi(authentication.session);
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
