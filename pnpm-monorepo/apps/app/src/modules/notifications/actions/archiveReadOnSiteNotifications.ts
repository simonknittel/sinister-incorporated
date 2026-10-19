"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { archiveReadOnSiteNotifications as archiveReadOnSiteNotificationsUseCase } from "@sam-monorepo/application";
import * as z from "zod";

const schema = z.object({});

export const archiveReadOnSiteNotifications = createAuthenticatedAction(
  "archiveReadOnSiteNotifications",
  schema,
  async (formData, authentication, data, t) => {
    try {
      await archiveReadOnSiteNotificationsUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    return { success: "Gelesene archiviert" };
  },
);
