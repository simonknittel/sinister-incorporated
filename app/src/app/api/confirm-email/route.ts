import { authenticate } from "@/auth/server";
import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { log } from "@/logging";
import { NextResponse, type NextRequest } from "next/server";
import { zfd } from "zod-form-data";

export const dynamic = "force-dynamic";

const paramsSchema = zfd.formData({
  token: zfd.text(),
});

export async function GET(request: NextRequest) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticate();
    if (!authentication) {
      void log.info("Unauthenticated request to API", {
        requestPath: "/api/confirm-email",
        requestMethod: "GET",
        reason: "No session",
      });

      throw new Error("Unauthenticated");
    }

    /**
     * Validate the request body
     */
    const paramsData = paramsSchema.parse(request.nextUrl.searchParams);

    /**
     * Do the thing
     */
    const result = await prisma.emailConfirmationToken.findUnique({
      where: {
        userId: authentication.session.user.id,
        email: authentication.session.user.email!,
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

    await prisma.$transaction([
      prisma.emailConfirmationToken.deleteMany({
        where: {
          userId: authentication.session.user.id,
        },
      }),
      prisma.user.update({
        where: {
          id: authentication.session.user.id,
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
