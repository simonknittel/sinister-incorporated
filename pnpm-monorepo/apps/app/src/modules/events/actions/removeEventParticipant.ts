"use server";

import {
  createUseCaseAction,
  notificationsFailedWarning,
} from "@/modules/application";
import {
  removeEventParticipantInputSchema,
  removeEventParticipant as removeEventParticipantUseCase,
} from "@sam-monorepo/application";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const removeEventParticipant = createUseCaseAction({
  name: "removeEventParticipant",
  schema: removeEventParticipantInputSchema,
  useCase: removeEventParticipantUseCase,
  parseFormData: (formData) => ({
    event_id: formData.get("eventId"),
    citizen_id: formData.get("citizenId"),
    reason: formData.get("reason") ?? undefined,
  }),
  texts: EVENT_ERROR_TEXTS,
  success: () => "Teilnehmer entfernt.",
  warning: notificationsFailedWarning,
});
