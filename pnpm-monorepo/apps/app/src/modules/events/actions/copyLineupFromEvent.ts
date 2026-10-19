"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
  type ApplicationErrorTexts,
} from "@/modules/application";
import {
  copyEventLineup,
  copyEventLineupInputSchema,
  EventErrorMessage,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_ENDED_TEXT } from "../utils/lineupErrorTexts";

/** A target that is gone gets the common not-found text */
const COPY_LINEUP_ERROR_TEXTS: ApplicationErrorTexts = {
  [EventErrorMessage.EventEnded]: EVENT_ENDED_TEXT,
};

export const copyLineupFromEvent = createAuthenticatedAction(
  "copyLineupFromEvent",
  copyEventLineupInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await copyEventLineup(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: COPY_LINEUP_ERROR_TEXTS,
      });
    }

    refresh();

    return {
      success: t("Common.successfullySaved"),
    };
  },
  {
    parseFormData: (formData) => ({
      target_event_id: formData.get("targetEventId"),
      source_event_id: formData.get("sourceEventId"),
    }),
  },
);
