/**
 * A greeting banner which an admin previews on the dashboard instead of the
 * banner of the day. The seasonal banner has its own preview: the seasonal
 * date override.
 */
export enum GreetingBannerPreview {
  Welcome = "welcome",
  Birthday = "birthday",
}

/** The names of the previews in the admin toolbar */
export const GREETING_BANNER_PREVIEW_LABELS: Record<
  GreetingBannerPreview,
  string
> = {
  [GreetingBannerPreview.Welcome]: "Welcome",
  [GreetingBannerPreview.Birthday]: "Birthday",
};
