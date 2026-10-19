"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { unsubscribeWebPush as unsubscribeWebPushUseCase } from "@sam-monorepo/application";
import { refresh } from "next/cache";
import * as z from "zod";

const schema = z.object({});

export const unsubscribeWebPush = createAuthenticatedAction(
  "unsubscribeWebPush",
  schema,
  async (formData, authentication, data, t) => {
    try {
      await unsubscribeWebPushUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    refresh();

    return {
      success: "Die Benachrichtigungen wurden auf allen Geräten deaktiviert.",
    };
  },
);
