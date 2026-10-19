"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  unarchiveOnSiteNotificationInputSchema,
  unarchiveOnSiteNotification as unarchiveOnSiteNotificationUseCase,
} from "@sam-monorepo/application";

export const unarchiveOnSiteNotification = createAuthenticatedAction(
  "unarchiveOnSiteNotification",
  unarchiveOnSiteNotificationInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await unarchiveOnSiteNotificationUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    return { success: "Wiederhergestellt" };
  },
  {
    parseFormData: (formData) => ({
      notification_id: formData.get("notificationId"),
    }),
  },
);
