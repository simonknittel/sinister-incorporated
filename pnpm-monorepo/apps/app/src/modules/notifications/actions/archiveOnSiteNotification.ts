"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  archiveOnSiteNotificationInputSchema,
  archiveOnSiteNotification as archiveOnSiteNotificationUseCase,
} from "@sam-monorepo/application";

export const archiveOnSiteNotification = createAuthenticatedAction(
  "archiveOnSiteNotification",
  archiveOnSiteNotificationInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await archiveOnSiteNotificationUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    return { success: "Archiviert" };
  },
  {
    parseFormData: (formData) => ({
      notification_id: formData.get("notificationId"),
    }),
  },
);
