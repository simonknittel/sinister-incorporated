"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import {
  eventParticipationInputSchema,
  updateEventParticipationComment as updateEventParticipationCommentUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapEventErrorToActionResponse } from "../utils/eventActionErrors";

export const updateEventParticipationComment = createAuthenticatedAction(
  "updateEventParticipationComment",
  eventParticipationInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateEventParticipationCommentUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapEventErrorToActionResponse(error, formData, t);
    }

    refresh();

    return {
      success: t("Common.successfullySaved"),
    };
  },
  {
    parseFormData: (formData) => ({
      event_id: formData.get("eventId"),
      comment: formData.get("comment") ?? undefined,
    }),
  },
);
