"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import { markAllOnSiteNotificationsRead as markAllOnSiteNotificationsReadUseCase } from "@sam-monorepo/application";

export const markAllOnSiteNotificationsRead = createUseCaseAction({
  name: "markAllOnSiteNotificationsRead",
  useCase: markAllOnSiteNotificationsReadUseCase,
  refresh: ActionRefresh.Never,
  success: () => "Alle als gelesen markiert",
});
