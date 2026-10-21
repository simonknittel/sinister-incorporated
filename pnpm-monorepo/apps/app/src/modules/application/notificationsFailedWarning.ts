import type { Translations } from "@/modules/actions/utils/createAction";

/**
 * The warning of a write whose notifications failed. The save of the write
 * stands.
 */
export const notificationsFailedWarning = (
  t: Translations,
  output: { readonly notifications_sent: boolean },
) => (output.notifications_sent ? undefined : t("Common.notificationsFailed"));
