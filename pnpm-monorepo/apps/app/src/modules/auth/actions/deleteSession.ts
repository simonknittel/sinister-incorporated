"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  deleteOwnSession,
  deleteOwnSessionInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { getCurrentSessionId } from "../queries/getCurrentSessionId";
import { AUTH_ERROR_TEXTS } from "../utils/authErrorTexts";

export const deleteSession = createAuthenticatedAction(
  "deleteSession",
  deleteOwnSessionInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await deleteOwnSession(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
        { currentSessionId: await getCurrentSessionId() },
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: AUTH_ERROR_TEXTS,
      });
    }

    refresh();

    return {
      success: t("Common.successfullyDeleted"),
    };
  },
  {
    parseFormData: (formData) => ({
      session_id: formData.get("id"),
    }),
  },
);
