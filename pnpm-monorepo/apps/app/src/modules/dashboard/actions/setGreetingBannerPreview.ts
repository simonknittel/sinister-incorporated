"use server";

import {
  ActionGate,
  createAuthenticatedAction,
} from "@/modules/actions/utils/createAction";
import { getServerCookieOptions } from "@/modules/common/utils/getServerCookieOptions";
import { cookies } from "next/headers";
import * as z from "zod";
import {
  GREETING_BANNER_PREVIEW_COOKIE,
  GREETING_BANNER_PREVIEW_COOKIE_MAX_AGE,
  greetingBannerPreviewSchema,
} from "../utils/greetingBannerPreviewCookie";

const schema = z.object({
  /** Empty removes the preview */
  preview: z.union([greetingBannerPreviewSchema, z.literal("")]),
});

export const setGreetingBannerPreview = createAuthenticatedAction(
  "setGreetingBannerPreview",
  schema,
  async (formData, authentication, data, t) => {
    const cookieStore = await cookies();

    if (data.preview === "") {
      cookieStore.delete(GREETING_BANNER_PREVIEW_COOKIE);
    } else {
      cookieStore.set(
        GREETING_BANNER_PREVIEW_COOKIE,
        data.preview,
        getServerCookieOptions(GREETING_BANNER_PREVIEW_COOKIE_MAX_AGE),
      );
    }

    return {
      success: t("Common.successfullySaved"),
    };
  },
  { gate: ActionGate.Admin },
);
