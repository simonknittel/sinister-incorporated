"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import {
  markOnSiteNotificationsReadInputSchema,
  markOnSiteNotificationsRead as markOnSiteNotificationsReadUseCase,
} from "@sam-monorepo/application";

export const markOnSiteNotificationsRead = createUseCaseAction({
  name: "markOnSiteNotificationsRead",
  schema: markOnSiteNotificationsReadInputSchema,
  useCase: markOnSiteNotificationsReadUseCase,
  parseFormData: (formData) => ({
    notification_ids: formData.getAll("notificationId"),
  }),
  refresh: ActionRefresh.Never,
  success: () => "Als gelesen markiert",
});
