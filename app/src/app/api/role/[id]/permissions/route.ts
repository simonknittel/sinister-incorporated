import { authenticateApi } from "@/auth/server";
import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { z } from "zod";

type Params = Promise<{
  id: string;
}>;

const paramsSchema = z.object({ id: z.string().cuid() });

const postBodySchema = z.array(
  z
    .string()
    .trim()
    .min(1)
    .regex(/^[\w\-]+;[\w\-]+(?:;[\w\-]+=[\w\-\*]+)*$/),
);

export async function POST(request: Request, props: { params: Params }) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi(
      "/role/[id]/permissions",
      "POST",
    );
    await authentication.authorizeApi("role", "manage");

    /**
     * Validate the request params and body
     */
    const paramsData = paramsSchema.parse(await props.params);
    const body: unknown = await request.json();
    const data = postBodySchema.parse(body);

    /**
     * Do the thing
     */
    await prisma.$transaction([
      prisma.permissionString.deleteMany({
        where: {
          roleId: paramsData.id,
        },
      }),

      ...data.map((permissionString) => {
        return prisma.permissionString.create({
          data: {
            roleId: paramsData.id,
            permissionString,
          },
        });
      }),
    ]);

    /**
     * Respond with the result
     */
    return NextResponse.json({});
  } catch (error) {
    /**
     * Respond with an error
     */
    return apiErrorHandler(error);
  }
}
