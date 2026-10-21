"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import { archiveReadOnSiteNotifications as archiveReadOnSiteNotificationsUseCase } from "@sam-monorepo/application";

export const archiveReadOnSiteNotifications = createUseCaseAction({
  name: "archiveReadOnSiteNotifications",
  useCase: archiveReadOnSiteNotificationsUseCase,
  refresh: ActionRefresh.Never,
  success: () => "Gelesene archiviert",
});
