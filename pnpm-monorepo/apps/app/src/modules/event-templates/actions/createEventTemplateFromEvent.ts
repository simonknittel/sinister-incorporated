"use server";

import { createUseCaseAction } from "@/modules/application";
import { EVENT_ERROR_TEXTS } from "@/modules/events/utils/eventErrorTexts";
import {
  createEventTemplateFromEventInputSchema,
  createEventTemplateFromEvent as createEventTemplateFromEventUseCase,
} from "@sam-monorepo/application";
import { getEventTemplatePath } from "../utils/eventTemplateConstraints";

export const createEventTemplateFromEvent = createUseCaseAction({
  name: "createEventTemplateFromEvent",
  schema: createEventTemplateFromEventInputSchema,
  useCase: createEventTemplateFromEventUseCase,
  parseFormData: (formData) => ({
    source_event_id: formData.get("sourceEventId"),
    name: formData.get("name"),
  }),
  texts: EVENT_ERROR_TEXTS,
  redirect: (output) => getEventTemplatePath(output.id),
});
