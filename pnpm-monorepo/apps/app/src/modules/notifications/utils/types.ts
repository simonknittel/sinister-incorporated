import type { RouterOutputs } from "@/trpc/react";

export type OnSiteNotificationRow =
  RouterOutputs["onSiteNotifications"]["list"]["items"][number];
