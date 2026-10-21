"use server";

import {
  createUseCaseAction,
  type ApplicationErrorTexts,
} from "@/modules/application";
import {
  copyEventLineup,
  copyEventLineupInputSchema,
  EventErrorMessage,
} from "@sam-monorepo/application";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

/** A target that is gone gets the common not-found text */
const COPY_LINEUP_ERROR_TEXTS: ApplicationErrorTexts = {
  [EventErrorMessage.EventEnded]:
    EVENT_ERROR_TEXTS[EventErrorMessage.EventEnded],
};

export const copyLineupFromEvent = createUseCaseAction({
  name: "copyLineupFromEvent",
  schema: copyEventLineupInputSchema,
  useCase: copyEventLineup,
  parseFormData: (formData) => ({
    target_event_id: formData.get("targetEventId"),
    source_event_id: formData.get("sourceEventId"),
  }),
  texts: COPY_LINEUP_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
