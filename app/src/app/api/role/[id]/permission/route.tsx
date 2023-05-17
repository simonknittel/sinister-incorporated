import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeApi } from "~/app/_utils/authorize";
import errorHandler from "~/app/api/_utils/errorHandler";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";

interface Params {
  id: string;
}

const postParamsSchema = z.string().cuid2();

const postBodySchema = z.object({
  key: z.string().trim().min(1).max(255),
  value: z.boolean(),
});

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request.
     */
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    /**
     * Authorize the request.
     */
    authorizeApi("edit-roles-and-permissions", session);

    /**
     * Validate the request params
     */
    const paramsData = await postParamsSchema.parseAsync(params.id);

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = await postBodySchema.parseAsync(body);

    /**
     * Do the thing
     */
    if (data.value) {
      const item = await prisma.permission.create({
        data: {
          role: {
            connect: {
              id: paramsData,
            },
          },
          key: data.key,
          value: data.value,
        },
      });

      /**
       * Respond with the result
       */
      return NextResponse.json(item);
    } else {
      await prisma.permission.delete({
        where: {
          roleId_key: {
            roleId: paramsData,
            key: data.key,
          },
        },
      });

      /**
       * Respond with the result
       */
      return NextResponse.json({});
    }
  } catch (error) {
    /**
     * Respond with an error
     */
    return errorHandler(error);
  }
}
