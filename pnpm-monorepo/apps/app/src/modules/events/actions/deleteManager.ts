"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  removeEventManager,
  removeEventManagerInputSchema,
} from "@sam-monorepo/application";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const deleteManager = createUseCaseAction({
  name: "deleteManager",
  schema: removeEventManagerInputSchema,
  useCase: removeEventManager,
  parseFormData: (formData) => ({
    event_id: formData.get("eventId"),
    citizen_id: formData.get("managerId"),
  }),
  texts: EVENT_ERROR_TEXTS,
  success: (t) => t("Common.successfullyDeleted"),
});
