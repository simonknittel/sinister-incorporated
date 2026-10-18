import { getApplicationContext } from "@/modules/application";
import apiErrorHandler from "@/modules/common/utils/apiErrorHandler";
import {
  confirmEmailWithToken,
  confirmEmailWithTokenInputSchema,
} from "@sam-monorepo/application";
import { NextResponse, type NextRequest } from "next/server";

/**
 * The `Referrer-Policy: no-referrer` header of this route is in
 * `next.config.ts`. A header of a route handler cannot replace a header of
 * the config.
 */
export async function GET(request: NextRequest) {
  try {
    /**
     * Validate the request
     */
    const input = confirmEmailWithTokenInputSchema.parse({
      token: request.nextUrl.searchParams.get("token"),
    });

    const { confirmed } = await confirmEmailWithToken(
      getApplicationContext(),
      input,
    );
    if (!confirmed)
      return NextResponse.redirect(new URL("/email-confirmation", request.url));

    return NextResponse.redirect(new URL("/clearance", request.url));
  } catch (error) {
    return apiErrorHandler(error);
  }
}
