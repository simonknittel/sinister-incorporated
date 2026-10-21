"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  eventParticipationInputSchema,
  updateEventParticipationComment as updateEventParticipationCommentUseCase,
} from "@sam-monorepo/application";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const updateEventParticipationComment = createUseCaseAction({
  name: "updateEventParticipationComment",
  schema: eventParticipationInputSchema,
  useCase: updateEventParticipationCommentUseCase,
  parseFormData: (formData) => ({
    event_id: formData.get("eventId"),
    comment: formData.get("comment") ?? undefined,
  }),
  texts: EVENT_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
