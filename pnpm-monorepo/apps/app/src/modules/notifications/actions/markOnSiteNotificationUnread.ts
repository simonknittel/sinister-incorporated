"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import {
  markOnSiteNotificationUnreadInputSchema,
  markOnSiteNotificationUnread as markOnSiteNotificationUnreadUseCase,
} from "@sam-monorepo/application";

export const markOnSiteNotificationUnread = createUseCaseAction({
  name: "markOnSiteNotificationUnread",
  schema: markOnSiteNotificationUnreadInputSchema,
  useCase: markOnSiteNotificationUnreadUseCase,
  parseFormData: (formData) => ({
    notification_id: formData.get("notificationId"),
  }),
  refresh: ActionRefresh.Never,
  success: () => "Als ungelesen markiert",
});
