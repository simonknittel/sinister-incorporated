"use server";

import { ActionRefresh, createUseCaseAction } from "@/modules/application";
import { markAllOnSiteNotificationsRead as markAllOnSiteNotificationsReadUseCase } from "@sam-monorepo/application";
import * as z from "zod";

const schema = z.object({});

export const markAllOnSiteNotificationsRead = createUseCaseAction({
  name: "markAllOnSiteNotificationsRead",
  schema,
  useCase: markAllOnSiteNotificationsReadUseCase,
  refresh: ActionRefresh.Never,
  success: () => "Alle als gelesen markiert",
});
