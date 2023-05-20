import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAndAuthorizeApi } from "~/app/_utils/authenticateAndAuthorize";
import errorHandler from "~/app/api/_lib/errorHandler";
import { prisma } from "~/server/db";

interface Params {
  id: string;
}

const paramsSchema = z.string().cuid2();

const postBodySchema = z.object({
  key: z.string().trim().min(1).max(255),
  value: z.union([z.literal("true"), z.literal("false")]),
});

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    await authenticateAndAuthorizeApi("edit-roles-and-permissions");

    /**
     * Validate the request params
     */
    const paramsData = await paramsSchema.parseAsync(params.id);

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = await postBodySchema.parseAsync(body);

    /**
     * Do the thing
     */
    if (data.value === "true") {
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
