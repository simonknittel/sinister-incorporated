"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import { archiveReadOnSiteNotifications as archiveReadOnSiteNotificationsUseCase } from "@sam-monorepo/application";
import * as z from "zod";

const schema = z.object({});

export const archiveReadOnSiteNotifications = createUseCaseAction({
  name: "archiveReadOnSiteNotifications",
  schema,
  useCase: archiveReadOnSiteNotificationsUseCase,
  refresh: ActionRefresh.Never,
  success: () => "Gelesene archiviert",
});
