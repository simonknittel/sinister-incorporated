"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import {
  unarchiveOnSiteNotificationInputSchema,
  unarchiveOnSiteNotification as unarchiveOnSiteNotificationUseCase,
} from "@sam-monorepo/application";

export const unarchiveOnSiteNotification = createUseCaseAction({
  name: "unarchiveOnSiteNotification",
  schema: unarchiveOnSiteNotificationInputSchema,
  useCase: unarchiveOnSiteNotificationUseCase,
  parseFormData: (formData) => ({
    notification_id: formData.get("notificationId"),
  }),
  refresh: ActionRefresh.Never,
  success: () => "Wiederhergestellt",
});
