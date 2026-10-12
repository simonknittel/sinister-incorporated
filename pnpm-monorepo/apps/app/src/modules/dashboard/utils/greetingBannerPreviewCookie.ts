import * as z from "zod";
import { GreetingBannerPreview } from "./GreetingBannerPreview";

/**
 * Names the greeting banner which the dashboard shows instead of the banner
 * of the day. The server honours it for every viewer, because it changes
 * nothing but their own view: it never marks a citizen as welcomed and never
 * sends a notification.
 */
export const GREETING_BANNER_PREVIEW_COOKIE = "greeting-banner-preview";

export const GREETING_BANNER_PREVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const greetingBannerPreviewSchema = z.enum(GreetingBannerPreview);

/** The preview the cookie names, or nothing */
export const parseGreetingBannerPreviewCookie = (
  cookieValue: string | undefined,
): GreetingBannerPreview | null => {
  const result = greetingBannerPreviewSchema.safeParse(cookieValue);

  return result.success ? result.data : null;
};
