"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { markAllOnSiteNotificationsRead as markAllOnSiteNotificationsReadUseCase } from "@sam-monorepo/application";
import * as z from "zod";

const schema = z.object({});

export const markAllOnSiteNotificationsRead = createAuthenticatedAction(
  "markAllOnSiteNotificationsRead",
  schema,
  async (formData, authentication, data, t) => {
    try {
      await markAllOnSiteNotificationsReadUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    return { success: "Alle als gelesen markiert" };
  },
);
