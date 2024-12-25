import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().cuid2(),
});

export async function GET(request: NextRequest) {
  try {
    /**
     * Validate the request
     */
    const paramsData = schema.parse({
      token: request.nextUrl.searchParams.get("token"),
    });

    const result = await prisma.emailConfirmationToken.findUnique({
      where: {
        token: paramsData.token,
        expires: {
          gt: new Date(),
        },
      },
    });
    if (!result)
      return NextResponse.redirect(
        new URL("/email-confirmation", request.url),
        {
          headers: {
            "Referrer-Policy": "no-referrer",
          },
        },
      );

    /**
     * Confirm the email address
     */
    await prisma.$transaction([
      prisma.emailConfirmationToken.deleteMany({
        where: {
          userId: result.userId,
        },
      }),

      prisma.user.update({
        where: {
          id: result.userId,
        },
        data: {
          emailVerified: new Date(),
        },
      }),
    ]);

    return NextResponse.redirect(new URL("/clearance", request.url), {
      headers: {
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    return apiErrorHandler(error, {
      headers: {
        "Referrer-Policy": "no-referrer",
      },
    });
  }
}
