import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import {
  GREETING_BANNER_PREVIEW_COOKIE,
  parseGreetingBannerPreviewCookie,
} from "../utils/greetingBannerPreviewCookie";

/** The greeting banner the preview cookie of this request names */
export const getGreetingBannerPreview = cache(async () =>
  parseGreetingBannerPreviewCookie(
    (await cookies()).get(GREETING_BANNER_PREVIEW_COOKIE)?.value,
  ),
);
